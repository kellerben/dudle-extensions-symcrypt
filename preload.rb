############################################################################
# Copyright 2010,2011 Benjamin Kellermann, Ole Rixmann                     #
#                                                                          #
# This file is part of dudle.                                              #
#                                                                          #
# Dudle is free software: you can redistribute it and/or modify it under   #
# the terms of the GNU Affero General Public License as published by       #
# the Free Software Foundation, either version 3 of the License, or        #
# (at your option) any later version.                                      #
#                                                                          #
# Dudle is distributed in the hope that it will be useful, but WITHOUT ANY #
# WARRANTY; without even the implied warranty of MERCHANTABILITY or        #
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public     #
# License for more details.                                                #
#                                                                          #
# You should have received a copy of the GNU Affero General Public License #
# along with dudle.  If not, see <http://www.gnu.org/licenses/>.           #
############################################################################

class Poll
	attr_reader :extensiondata
end

GetText.bindtextdomain("dudle_symcrypt", :path => "#{Dir.pwd.force_encoding("UTF-8")}/../extensions/#{$current_ext_dir}/locale/")

if $d.table && $d.table.extensiondata && $d.table.extensiondata["Symcrypt"]
#   if $cgi.include?("nojs")
		Poll.table_html_hooks << lambda { |currenttext|
			ret = ""
			ret += "<tr id='symcryptJSwarning'>"
			ret += "<td class='warning' colspan='#{$d.table.head.col_size+3}'>"
			ret += _("Parts of this poll can only be accessed with JavaScript. You have to enable JavaScript and reload this page to see these parts and to protect your vote by password.")
			ret += "</td></tr>"
			ret
		}
#   else
#     class Poll
#       def edituser_to_html
#         ret = ""
#         ret += "<tr id='add_participant'>"
#         ret += "<td colspan='#{@head.col_size+3}'>"
#         ret += _("Parts of this poll can only be accessed with JavaScript. You have to enable JavaScript and reload this page to see these parts and to protect your vote by password.")
#         ret += "<div><input type='submit' value='";
#         ret += _("I have enabled JavaScript, please reload the page");
#         ret += "' /> <input type='button' value='";
#         ret += _("Continue without JavaScript (my vote is not password-protected)");
#         ret += "' /></div>";
#         ret += "</td></tr>"
#         ret
#       end
#     end
#   end
end
