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



extDir = "../extensions/symcrypt"
if File.exists?("#{extDir}/locale/#{GetText.locale.language}/dudle_symcrypt.po")
	$d.html.add_html_head("<link rel='gettext' type='application/x-po' href='#{extDir}/locale/#{GetText.locale.language}/dudle_symcrypt.po' />")
end

$d.html.add_head_script("#{extDir}/lib/sjcl.js")

$d.html.add_head_script("#{extDir}/common.js")

$d.html.add_script(<<SCRIPT
Symcrypt.extDir = '#{extDir}';
Symcrypt.passwordStar = '#{PASSWORDSTAR}';
SCRIPT
)

case $d.tab
when "access_control.cgi"
  $d.html.add_head_script("#{extDir}/access_control.js")
when "." 
  if $d.is_poll?
    $d.html.add_head_script("#{extDir}/participate.js")
		$d.html.add_html_head("<link rel='stylesheet' type='text/css' href='#{extDir}/symcrypt.css' />")
  end
when "overview.cgi"
	$d.html.add_head_script("#{extDir}/overview.js")
end


