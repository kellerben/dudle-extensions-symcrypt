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

Symcrypt.askForPasswd = function (message) {
	alert("FIXME: implement me! \n" + message);
};

Symcrypt.decryptDB = function () {
	try {
		Symcrypt.pollPW = sjcl.decrypt(Symcrypt.password, Symcrypt.encryptedPollPW);
	} catch (e) {
		if (e.toString() === "CORRUPT: ccm: tag doesn't match") {
			Symcrypt.askForPasswd(_("The password was wrong!"));
			return;
		} else {
			throw e;
		}
	}
	Poll.load("Symcrypt", Symcrypt.pollPW, 
		{ 
			success: function (resp) {
				Symcrypt.db = JSON.parse(sjcl.decrypt(Symcrypt.password, resp));
				$.each(Symcrypt.db, function (index, user) {
					Symcrypt.addRow(user);
				});
			},
			failure: function (r) {
				Symcrypt.db = {};
			}
		}
	);
};

Symcrypt.parseParticipantInputArray = function (arr) {
	var ret = {};
	ret.name = arr[1].value;
	$.each(arr, function (i, e) {
		var col = e.name.match(/^add_participant_checked_(.*)$/);
		if (col) {
			ret[col[1]] = e.value;
		}
	});
	return ret;
};

Symcrypt.addRow = function (user) {
	if ($("#" + gfHtmlID(user.name) + "_tr").length !== 0) {
		Poll.rmRow(user.name);
	}

	var htmlrow = new cloneObject(user);
	htmlrow.name = "<span class='username'>" + user.name + "</span><span class='symcryptEncrypted'></span>";
	htmlrow.editUser = "Symcrypt.editUser";
	htmlrow.deleteUser = "Symcrypt.deleteUser";
	Poll.parseNaddRow(user.name, htmlrow);
};

Symcrypt.deleteUser = function (user) {
	delete Symcrypt.db[user];
	Symcrypt.storePoll();
	Poll.rmRow(user);
};

Symcrypt.editUser = function (user) {
	alert("implement me!");
};

Symcrypt.storePoll = function () {
	Poll.store("Symcrypt", Symcrypt.pollPW, sjcl.encrypt(Symcrypt.password, JSON.stringify(Symcrypt.db)));
};


$(document).ready(function () {
	Symcrypt.getDB({
		success: function (enc) {
			Symcrypt.encryptedPollPW = enc;

			Symcrypt.password = location.href.match(/#.*passwd=([^\?]*)/);
			if (Symcrypt.password) {
				Symcrypt.password = Symcrypt.password[1];
			} else {
				Symcrypt.password = localStorage["Symcrypt_" + Poll.ID + "_passwd"];
			}
			if (!Symcrypt.password) {
				Symcrypt.askForPasswd();
				return false;
			}
			Symcrypt.decryptDB();

			$("#polltable form").live("submit", function (e) {
				var user_input = Symcrypt.parseParticipantInputArray($(this).serializeArray());
				if (user_input.name.length === 0) {
					return false;
				}

				user_input.name = escapeHtml(user_input.name);

				Symcrypt.db[user_input.name] = user_input;

				Symcrypt.addRow(user_input);
				this.reset();
				return false;
			});
		}
	});
});
