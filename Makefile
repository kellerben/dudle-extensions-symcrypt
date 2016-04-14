############################################################################
# Copyright 2009,2010,2011 Benjamin Kellermann                             #
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

locale: $(foreach p,$(wildcard locale/*/dudle.po), $(addsuffix .mo,$(basename $p)))

RGETTEXT=$(firstword $(shell which rgettext rxgettext))

locale/dudle.pot: *.js *.rb
	rm -f $@
	$(RGETTEXT) *.rb -o $@
	xgettext -j -L Python *.js -o $@

%.mo: %.po
	msgfmt $*.po -o $*.mo

locale/%/dudle.po: locale/dudle.pot
	msgmerge $@ $? >/tmp/dudle_$*_tmp.po
	if [ "`msgcomm -u /tmp/dudle_$*_tmp.po $@`" ];then\
		mv /tmp/dudle_$*_tmp.po $@;\
	else\
		touch $@;\
	fi
	@if [ "`potool -fnt $@ -s`" != "0" -o "`potool -ff $@ -s`" != "0" ];then\
		echo "WARNING: There are untranslated Strings in $@";\
		if [ "X:$$DUDLE_POEDIT_AUTO" = "X:$*" ]; then\
			poedit $@;\
		fi;\
	fi

check: $(foreach p,$(wildcard *.js), $p.check)
%.js.check: %.js
	echo -n "/*jslint cap: true, newcap: false, regexp: false, strict: true, browser: true, nomen: false, plusplus: false */" > /tmp/$*.js
	echo -n "/*global alert, confirm, window, localStorage, $$, _, printf, escapeHtml, gfHtmlID, gfStoreLocal, gfGetLocal, gfHasLocalStorage, cloneObject, Poll" >> /tmp/$*.js
	echo -n ", Symcrypt, sjcl" >> /tmp/$*.js
	echo -n " */" >> /tmp/$*.js
	cat $*.js >> /tmp/$*.js
	jslint /tmp/$*.js

compressed: $(foreach p,$(wildcard *.js), compressed/$p)
compressed/%.js: %.js.check %.js
	cat $*.js |ruby lib/jsmin.rb > $@

watch:
	while true; do\
		FILE=`inotifywait -e close_write --format="%w%f" --exclude '(/[^\\.]*\$$|\\.swp\$$|qt_temp\\..*)' . 2>/dev/null`;\
		EXT=`echo $$FILE|sed -e 's/^.*\.\([^.]*\)$$/\1/g'`;\
		FILEBASENAME=`basename $$FILE .$$EXT`;\
		case $$EXT in\
		js)\
			make compressed/$$FILEBASENAME.$$EXT;\
			;;\
		*)\
			echo "$$FILE was modified and I don't know what to do!";\
			continue;\
			;;\
		esac;\
	done

