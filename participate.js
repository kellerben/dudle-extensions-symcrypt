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
	var innerTr = [];
	innerTr.push($("<td />", {
		"colspan" : 2,
		"text" : _("Please enter the password:")
	}));
	innerTr.push($("<td />", {
		"colspan" : Poll.columns.length,
	})
	.append($("<input />",{
		"type" : 'password',
		"id" : 'symcryptpasswd'
	}))
	.append($("<br />"))
	.append($("<input />",{
		"type" : 'checkbox',
		"id" : 'rememberMe',
		"onclick" : 'Symcrypt.storePasswdLocally = !Symcrypt.storePasswdLocally',
		"checked" : 'checked'
	}))
	.append("&nbsp;")
	.append($("<label />", {
		"for" : 'rememberMe',
		"text" : _("remember password")
	})));

	innerTr.push($("<td />")
		.append($("<input />", {
			"type" : 'submit',
			"value" : _("Save")
		}))
	);
	Poll.exchangeAddParticipantRow(innerTr);
	$("#polltable form").unbind("submit");
	$("#polltable form").bind("submit", Symcrypt.tryPasswd);
};

Symcrypt.disable = function () {
	Poll.exchangeAddParticipantRow();
	$("#polltable form").unbind("submit");
};



Symcrypt.askForPasswd = function (message, buttontext) {
	var innerTr = $("<td />", {
		"colspan" : Poll.columns.length + 3,
		"text" : message
	});
	innerTr.append($("<div />")
			.append($("<input />",{
				"type" : "button",
				"onclick" : 'Symcrypt.enterPasswd()',
				value: buttontext
			}))
			.append(" ")
			.append($("<input />",{
				"type" : 'button',
				"onclick" : 'Symcrypt.disable()',
				"value" : _("Continue without password (my vote is not password-protected)")
			}))
	);
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
	$("#tablist").append($("<li />", {
			"id" : 'logoutTab',
			"class" : 'nonactive_tab'
		})
		.append($("<a />",{
			"href" : 'javascript:Symcrypt.logout();',
			"html" : "&nbsp;" + _("Logout") + "&nbsp;"
		}))
	);
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
	htmlrow.editUser = Poll.editUser;
	htmlrow.deleteUser = Symcrypt.deleteUser;
	Poll.parseNaddRow(htmlrow);
};

Symcrypt.deleteUser = function (user) {
	var username = user, userindex = -1;
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
		$(document).ajaxStop(function() {
			$(this).unbind("ajaxStop");

			var userindex = -1, olduser;
			if (user_input.oldname) {
				$.each(Symcrypt.db, function (i, u) {
					if (user_input.oldname === u.name) {
						userindex = i;
					}
				});
				olduser = user_input.oldname;
				delete user_input.oldname;
			}
			if (userindex === -1) {
				userindex = $.inArray("", Symcrypt.db) === -1 ? Symcrypt.db.length : $.inArray("", Symcrypt.db);
			}


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
		});
		Symcrypt.loadVotes();
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
