require "dudletest"

class ACTest  < Test::Unit::TestCase
	include DudleTest
	def setup_poll
		@pollid = "symcrypt_create_test"
		if @@options.fast_setup
			@s.open("/example.cgi?poll=#{@pollid}")

			# this does not work, doing manual redirect wait
			#@s.wait_for_page_to_load("3000")
			#@s.wait_for({:wait_for => :element, :element => "active_tab" })
			while @s.location =~ /example.cgi/
				sleep 0.1 # wait for redirect
				puts "sleeping"
			end
		else
			raise "not implemented"
		end

		@s.open("/#{@pollid}/access_control.cgi")
		@s.set_speed(@@options.speed)
	end

	def test_initSymcrypt
		@s.submit("ac")
		@s.wait_for_page_to_load("3000")
		@s.submit("ac_admin")
		wait_for_all

		@s.click("css=#ac_participant input[type=submit]")
		assert(@s.text?("Password must not be empty."))

		@s.type("password0", "foo")
		@s.type("password1", "bar")
		@s.click("css=#ac_participant input[type=submit]")
		assert(@s.text?("Passwords did not match."))

		@s.type("password1", "foo")
		@s.click("css=#ac_participant input[type=submit]")
		@s.open("/#{@pollid}/overview.cgi")
		wait_for_all
		assert(@s.text?("/#{@pollid}/#passwd=foo"))
	end
end

