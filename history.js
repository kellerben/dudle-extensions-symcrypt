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

Symcrypt.addRow = function (user) {
	if ($("#" + gfHtmlID(user.name) + "_tr").length !== 0) {
		Poll.rmRow(user.name);
	}

	var htmlrow = new cloneObject(user);
	htmlrow.before_name = "<img class='symcryptEncrypted'";
	htmlrow.before_name += " alt='" + _("Encrypted Vote") + "'";
	htmlrow.before_name += " style='float: left'";
	htmlrow.before_name += " src='" + Symcrypt.extDir + "/img/encrypted.png' />";
	Poll.parseNaddRow(htmlrow);
};

$(document).ready(function () {
	if (location.href.match(/revision=(\d*)/)) {
		Symcrypt.pollRevision = location.href.match(/revision=(\d*)/)[1];
	}
	Symcrypt.getDB({
		success: function (enc) {
			Symcrypt.encryptedPollPW = enc;

			Symcrypt.password = location.href.match(/#.*passwd=([^\?]*)/);
			if (Symcrypt.password) {
				Symcrypt.password = Symcrypt.password[1];
			} else {
				Symcrypt.password = gfGetLocal("Symcrypt_" + Poll.ID + "_passwd");
			}
			Symcrypt.decryptDB();
		},
		error: {} // poll without symcrypt
	});
});
