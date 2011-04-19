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

Symcrypt.AcAlreadyInitialized = function() {
	$("#ac_admin input[type=submit]").remove();
	$("#ac_participant input[type=submit]").remove();
	var pw = "aaaaaaaaaaaaaa".replace(/a/g,Symcrypt.passwordStar);
	$("#password0").replaceWith(pw);
	$("#password1").replaceWith(pw);
};

Symcrypt.AcNotInitialized = function() {
	$("#ac_participant").submit(function() {
		$("#participanthint .error").remove();
		if ($("#password0")[0].value == "") {
			$("#participanthint").append("<div class='error'>" + _("Password must not be empty.") + "</div>");
			return false;
		}
		if ($("#password0")[0].value != $("#password1")[0].value) {
			$("#participanthint").append("<div class='error'>" + _("Passwords did not match.") + "</div>");
			return false;
		}

		// create new DB
		var password = $("#password0")[0].value;
		localStorage["Symcrypt_" + Poll.ID + "_passwd"] = password;
		if (sjcl.random.isReady()) {
			var rand = sjcl.random.randomWords(3);
		}	else {
			var rand = [];
			rand[0] = Math.random()*9999999;
			rand[1] = Math.random()*9999999;
			rand[2] = Math.random()*9999999;
		}
		Poll.store("Symcrypt",
			"init",
			sjcl.encrypt(password,sjcl.codec.base64.fromBits(rand)),
			{	write_passwd_new: rand.join("")}
		);

		Symcrypt.AcAlreadyInitialized();
		return false;
	});
};

$(document).ready(function() {
	if ($("#ac_participant").length == 1) {
		Symcrypt.getDB({
			success: Symcrypt.AcAlreadyInitialized,
			failure: Symcrypt.AcNotInitialized
		}); 
	}
});
