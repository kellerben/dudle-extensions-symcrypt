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

$(document).ready(function () {
	var pwd = localStorage["Symcrypt_" + Poll.ID + "_passwd"],
	url;
	if (pwd) {
		pwd = "#passwd=" + pwd;
		url = $("#humanReadableURL").attr("value");
		$("#humanReadableURL").attr({value: url + pwd});
		$("#mailtoURL").attr({
			href: $("#mailtoURL").attr("href").replace("/" + Poll.ID + "/", "/" + Poll.ID + "/" + pwd)
		});
		$("a[href='" + url + "']").append(pwd).attr({href: url + pwd});
	}
});
