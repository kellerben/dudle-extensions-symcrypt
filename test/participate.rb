require "dudletest"
YES   = "a_yes__"
NO    = "c_no___"
MAYBE = "b_maybe"

A = OpenStruct.new(
	:name => "Alice",
	:vote => [NO,YES,MAYBE]
)
A2 = OpenStruct.new(
	:name => "Alice",
	:vote => [YES,YES,YES]
)
B = OpenStruct.new(
	:name => "Bob",
	:vote => [YES,YES,NO]
)
C = OpenStruct.new(
	:name => "Carol",
	:vote => [YES,NO,YES]
)
D = OpenStruct.new(
	:name => "Dave",
	:vote => [YES,YES,YES]
)
M = OpenStruct.new(
	:name => "Mallory",
	:vote => [MAYBE,NO,YES]
)

def vote_to_i(v)
	v.class == String ? (v == YES ? 1 : 0) : v
end

class Array
	def add_indexwise other
		raise "Can only add two arrays with same size" if self.size != other.size
		ret = []
		self.each_with_index{|e,i| ret[i] = vote_to_i(self[i]) + vote_to_i(other[i]) }
		ret
	end
end

class ParticipateTest  < Test::Unit::TestCase
	include DudleTest

	def setup_poll
		if @@options.fast_setup
			@s.open("/example.cgi?poll=symcrypt_participate_test")

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

		location = @s.location
		@s.open("/")
		@s.open(location + "#passwd=blabla")
		wait_for_ajax
	end

	def vote(user, test = 'symcrypt')
		@s.type("add_participant_input", user.name)
		user.vote.each_with_index{|vote,index|
			@s.click("//tr[@id='add_participant']//td[@class='checkboxes'][#{index+1}]//tr[@class='input-#{vote}']//input")
		}

		@s.click("savebutton")
		if test == 'symcrypt'
			wait_for_ajax
			assert_equal(user.name,@s.text("//tr[@id='#{user.name}_tr']//td[2]"))
			assert(@s.element?("//tr[@id='#{user.name}_tr']//img[@class='symcryptEncrypted']"))
		else
			wait_for_all
			assert(@s.element?("//span[@id='#{user.name}']"))
		end
	end
	def delete(user)
		@s.click("//a[@title='Delete User #{user.name} ...']")
		wait_for_ajax
	end
	def change(olduser,newuser,cancel = false)
		@s.click("//a[@title='Edit User #{olduser.name} ...']")
		if cancel
			@s.click("//input[@value='Cancel']") 
			return
		end

		wait_for_ajax
		vote(newuser)
	end
	def assert_voteResult(userarray)
		voteresult = [0] * userarray[0].vote.size
		userarray.each{|user|
			voteresult = voteresult.add_indexwise(user.vote)
		}
		voteresult.each_with_index{|sum, index|
			assert_equal(sum.to_s, @s.text("//tr[@id='summary']//td[#{index+2}]"), "Index #{index} was wrong")
		}
	end
	def test_voteencrypted
		vote(A)
		assert_voteResult([A])
		vote(B)
		assert_voteResult([A,B])
		reload
		assert_voteResult([A,B])
	end
	def test_delete
		vote(A)
		vote(B)
		delete(A)
		assert_voteResult([B])
		vote(C)
		assert_voteResult([B,C])
		reload
		assert_voteResult([B,C])
		@s.click("//a[@title='Edit User #{B.name} ...']")
		delete(C)
		assert_voteResult([B])
	end
	def test_change
		vote(A)
		vote(B)
		reload
		change(A,C,true)
		assert_voteResult([A,B])
		reload
		change(A,A2)
		sleep(0.5) # this is needed for some reason
		assert_voteResult([A2,B])
		reload
		change(A2,C)
		sleep(0.5) # this is needed for some reason
		assert_voteResult([B,C])
		reload
		assert_voteResult([B,C])
	end
	def test_plaintextvote
		vote(B)
		vote(D)
		logout
		reload(false)
		@s.click("//input[@value='Continue without password (my vote is not password-protected)']")
		vote(A,"plain")
		assert_voteResult([A])

		# PASSWD WRONG
		@s.click("//input[@value='Enter password']")
		@s.type("symcryptpasswd", "frebf203cs9bigfap")
		@s.click("//input[@value='Save']")
		wait_for_ajax
		assert(@s.text?("The password you entered was wrong!"))
		@s.click("//input[@value='Try again']")

		# REMEMBER PASSWD
		@s.click("rememberMe")
		@s.type("symcryptpasswd", "blabla")
		@s.click("//input[@value='Save']")
		wait_for_ajax
		assert_voteResult([A,B,D])

		reload(false)
		assert_voteResult([A])

		@s.click("//input[@value='Enter password']")
		@s.type("symcryptpasswd", "blabla")
		@s.click("//input[@value='Save']")
		wait_for_ajax
		assert_voteResult([A,B,D])
		reload
		assert_voteResult([A,B,D])

		# LOGIN WITH ADDRESS
		logout
		@s.open("/")
		@s.open("/symcrypt_participate_test/#passwd=blabla")
		wait_for_all
		assert_voteResult([A,B,D])
		reload
		assert_voteResult([A,B,D])
	end
	def reload(login = true)
		@s.open("/symcrypt_participate_test")
		wait_for_all
		assert_equal(login,@s.location.include?("#passwd=blabla")) 
	end
	def logout
		@s.click("//li[@id='logoutTab']//a")
		assert_equal("Do not forget to clean your browser history!",@s.alert)
		wait_for_all
	end

end

