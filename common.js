/****************************************************************************
 * Copyright 2010,2011, Ole Rixmann, Benjamin Kellermann                    *
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

// Register Namespace
if (typeof(Symcrypt) === "undefined") {
	var Symcrypt = {};
} else {
	alert("Somebody captured the Namespace Symcrypt!!!");
}
$(document).ready(function () {
	$("#symcryptJSwarning").remove();
});


sjcl.random.startCollectors();

Symcrypt.getDB = function () {
	var options = arguments[0] || {};
	if (Symcrypt.pollRevision) {
		options.revision = Symcrypt.pollRevision;
	}
	Poll.load("Symcrypt", "init", options);
};



/* functions common for participate and history */

Symcrypt.db = [];
Symcrypt.loadVotes = function () {
	Poll.load("Symcrypt", Symcrypt.pollPW + "_" + Symcrypt.db.length, {
		type: "json",
		error: {}, // finished now
		revision: Symcrypt.pollRevision,
		success: function (resp) {
			if (resp.data === "") {
				Symcrypt.db.push("");
			} else {
				var user = JSON.parse(sjcl.decrypt(Symcrypt.password, resp.data));
				user.name = user.name.replace(/'/, "").replace(/"/, "");
				user.time = resp.time;
				Symcrypt.addRow(user);
				Symcrypt.db.push(user);
				//Symcrypt.removePrefilledUser(); ??? FIXME: is this really needed ???
			}
			Symcrypt.loadVotes();
		}
	});
};

/* decrypts the AES key, returns {true, false} if successful (pw correct) */
Symcrypt.decryptDB = function () {
	try {
		Symcrypt.pollPW = sjcl.decrypt(Symcrypt.password, Symcrypt.encryptedPollPW);
	} catch (e) {
		if (e.toString() === "CORRUPT: ccm: tag doesn't match") {
			return false;
		} else {
			throw e;
		}
	}
	Symcrypt.loadVotes();
	return true;
};
