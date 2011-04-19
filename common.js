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

// Register Namespace
if (typeof(Symcrypt) == "undefined") {
	var Symcrypt = {};
} else {
	alert("Somebody captured the Namespace Symcrypt!!!");
}


sjcl.random.startCollectors();

Symcrypt.getDB = function() {
	var options = arguments[0] || {};
	Poll.load("Symcrypt", "init", options);
};
