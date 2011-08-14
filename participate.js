/****************************************************************************
 * Copyright 2011 Benjamin Kellermann                                       *
 *                                                                          *
 * This file is part of dudle.                                              *
 *                                                                          *
 * Dudle is free software: you can redistribute it and/or modify it under   *
 * the terms of the GNU Affero General Public License as published by       *
 * the Free Software Foundation, either version 3 of the License, or        *
 * (at your option) any later version.                                      *
 *                                                                          *
 * Dudle is distributed in the hope that it will be useful, but WITHOUT ANY *
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or        *
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public     *
 * License for more details.                                                *
 *                                                                          *
 * You should have received a copy of the GNU Affero General Public License *
 * along with dudle.  If not, see <http://www.gnu.org/licenses/>.           *
 ***************************************************************************/

"use strict";



Symcrypt.storePasswdLocally = true;

Symcrypt.tryDecrypt = function () {
	if (Symcrypt.decryptDB()) {
		if (Symcrypt.storePasswdLocally) {
			if (gfStoreLocal("Symcrypt_" + Poll.ID + "_passwd", Symcrypt.password)) {
				Symcrypt.showLogout();
			}

			var pw = location.href.match(/#.*passwd=([^\?]*)/);
			if (!pw || pw[1] !== Symcrypt.password) {
				location.href = location.href + "#passwd=" + Symcrypt.password;
			}

		}
	} else {
		Symcrypt.askForPasswd(_("The password you entered was wrong!"), _("Try again"));
	}
}

Symcrypt.tryPasswd = function (e) {
	e.preventDefault();
	Symcrypt.password = $("#symcryptpasswd")[0].value;
	Poll.exchangeAddParticipantRow();

	Symcrypt.tryDecrypt();

	$("#polltable form").unbind("submit");
	Poll.submitHook(Symcrypt.addUser);
	return false;
};

Symcrypt.enterPasswd = function () {
	Poll.exchangeAddParticipantRow();
	var innerTr = "<td colspan='2'>";
	innerTr += _("Please enter the password:");
	innerTr += "</td><td colspan='"; 
	innerTr += Poll.columns.length;
	innerTr += "'><input type='password' id='symcryptpasswd' />";
	innerTr += "<br /><input type='checkbox' id='rememberMe' onclick='Symcrypt.storePasswdLocally = !Symcrypt.storePasswdLocally' checked='checked' />&nbsp;<label for='rememberMe'>";
	innerTr += _("remember password");
	innerTr += "</label>";
	innerTr += "</td><td><input type='submit' value='";
	innerTr += _("Save");
	innerTr += "' />";
	innerTr += "</td>";
	Poll.exchangeAddParticipantRow(innerTr);
	$("#polltable form").unbind("submit");
	$("#polltable form").bind("submit", Symcrypt.tryPasswd);
};

Symcrypt.disable = function () {
	Poll.exchangeAddParticipantRow();
	$("#polltable form").unbind("submit");
};



Symcrypt.askForPasswd = function (message, buttontext) {
	var innerTr = "<td colspan='";
	innerTr += Poll.columns.length + 3;
	innerTr += "'>";
	innerTr += message;
	innerTr += "<div><input type='button' onclick='Symcrypt.enterPasswd()' value='";
	innerTr += buttontext;
	innerTr += "' /> <input type='button' onclick='Symcrypt.disable()' value='";
	innerTr += _("Continue without password (my vote is not password-protected)");
	innerTr += "' /></div></td>";
	Poll.exchangeAddParticipantRow(innerTr);
};

Symcrypt.removePrefilledUser = function () {
	var olduser = $("#add_participant_input")[0].value;
	if ($.inArray(olduser, Symcrypt.db) !== -1) {
		$("#polltable form input[name='olduser']")[0].value = "";
		$("#add_participant_input")[0].value = "";
	}
};

Symcrypt.showLogout = function () {
	$("#tablist").append("<li id='logoutTab' class='nonactive_tab'><a href='javascript:Symcrypt.logout();'>&nbsp;" + _("Logout") + "&nbsp;</a></li>");
};
Symcrypt.logout = function () {
	localStorage.clear();
	alert(_("Do not forget to clean your browser history!"));
	location.href = location.href.replace(/#.*/, "");
};


Symcrypt.addRow = function (user) {
	if ($("#" + gfHtmlID(user.name) + "_tr").length !== 0) {
		Poll.rmRow(user.name);
	}

	var htmlrow = new cloneObject(user);
	htmlrow.before_name = "<img class='symcryptEncrypted'";
	htmlrow.before_name += " alt='" + _("Encrypted Vote") + "'";
	htmlrow.before_name += " style='float: left'";
	htmlrow.before_name += " src='" + Symcrypt.extDir + "/img/encrypted.png' />";
	htmlrow.editUser = "Poll.editUser";
	htmlrow.deleteUser = "Symcrypt.deleteUser";
	Poll.parseNaddRow(htmlrow);
};

Symcrypt.deleteUser = function (user) {
	var username = escapeHtml(user), userindex = -1;
	Poll.cancelPossibleEdit();
	$.each(Symcrypt.db, function (i, user) {
		if (user.name === username) {
			userindex = i;
		}
	});

	Poll.store("Symcrypt", Symcrypt.pollPW + "_" + userindex, "", {
		success: function () {
			Poll.rmRow(user);
			Symcrypt.db[userindex] = "";
			Poll.resetForm();
			Symcrypt.removePrefilledUser();
		}
	});
};

Symcrypt.addUser = function (user_input) {
	if (user_input.name.length !== 0) {
		if (user_input.name.match(/"/) || user_input.name.match(/'/)) {
			Poll.hint(_("The username must not contain the characters ' and \"!"), "error");
			return false;
		}
		var userindex = -1, olduser;
		if (user_input.oldname) {
			$.each(Symcrypt.db, function (i, u) {
				if (escapeHtml(user_input.oldname) === u.name) {
					userindex = i;
				}
			});
			olduser = user_input.oldname;
			delete user_input.oldname;
		}
		if (userindex === -1) {
			userindex = $.inArray("", Symcrypt.db) === -1 ? Symcrypt.db.length : $.inArray("", Symcrypt.db);
		}
		user_input.name = escapeHtml(user_input.name);

		Poll.store("Symcrypt", Symcrypt.pollPW + "_" + userindex, sjcl.encrypt(Symcrypt.password, JSON.stringify(user_input)), {
			success: function () {
				if (olduser) {
					Poll.cancelEdit();
					Poll.rmRow(olduser);
				}
				user_input.time = new Date();
				Symcrypt.addRow(user_input);
				Poll.resetForm();
				Symcrypt.removePrefilledUser();
				Symcrypt.db[userindex] = user_input;
			}
		});

	}
	return false;
};




$(document).ready(function () {
	Symcrypt.getDB({
		success: function (enc) {
			Symcrypt.encryptedPollPW = enc;

			Symcrypt.password = location.href.match(/#.*passwd=([^\?]*)/);
			if (Symcrypt.password) {
				Symcrypt.password = Symcrypt.password[1];
			} else {
				Symcrypt.password = gfGetLocal("Symcrypt_" + Poll.ID + "_passwd");
			}
			if (!Symcrypt.password) {
				Symcrypt.askForPasswd(_("Parts of this poll are protected by a password. You have to provide the password to see password-protected parts and to protect your vote by the password."), _("Enter password"));
				return false;
			}
			Symcrypt.tryDecrypt();

			$("#polltable form").unbind("submit");
			Poll.submitHook(Symcrypt.addUser);
		},
		error: {} // poll without symcrypt
	});
});
