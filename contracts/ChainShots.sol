// Import the FungibleToken contract
import FungibleToken from 0x9a0766d93b6608b7

// Import the Chainlink contract
import Chainlink from 0x8d0e87b65159ae63

// Define a resource that implements the FungibleToken interface
pub resource CryptoGramToken: FungibleToken {

    // Define the public properties of the token
    pub var totalSupply: UFix64
    pub var name: String
    pub var symbol: String
    pub var decimals: UInt8

    // Define the balances for each account
    access(account) var balances: @{String: UFix64}

    // Initialize the token with the given parameters
    init(name: String, symbol: String, decimals: UInt8, initialSupply: UFix64) {
        pre {
            // Require a valid name, symbol and decimals
            name.length > 0 && symbol.length > 0 && decimals > 0:
                "Invalid parameters"
        }
        self.name = name
        self.symbol = symbol
        self.decimals = decimals
        self.totalSupply = initialSupply
        self.balances = {}
    }

    // Withdraw an amount of tokens from the owner's balance
    pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
        pre {
            // Require a positive amount
            amount > 0.0:
                "Invalid amount"
        }
        let owner = self.owner?.address?.toString()
        if owner == nil {
            panic("Missing owner address")
        }
        // Get the current balance of the owner
        let balance = self.balances[owner] ?? 0.0

        // Ensure the owner has enough tokens to withdraw
        if balance < amount {
            panic("Insufficient funds")
        }

        // Update the owner's balance and the total supply
        self.balances[owner] = balance - amount
        self.totalSupply = self.totalSupply - amount

        // Return a new Vault resource with the withdrawn amount
        return <-create Vault(balance: amount)
    }

    // Deposit an amount of tokens to the owner's balance
    pub fun deposit(from: @FungibleToken.Vault) {
        let owner = self.owner?.address?.toString()
        if owner == nil {
            panic("Missing owner address")
        }
        // Get the current balance of the owner
        let balance = self.balances[owner] ?? 0.0

        // Update the owner's balance and the total supply
        self.balances[owner] = balance + from.balance
        self.totalSupply = self.totalSupply + from.balance

        // Destroy the Vault resource
        destroy from
    }

    // Get the balance of an account by address
    pub fun balance(address: Address): UFix64 {
        return self.balances[address.toString()] ?? 0.0
    }

    // Create a new Vault resource with an initial balance
    pub fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }
}

// Define a contract that creates and manages CryptoGramToken resources and videos 
pub contract CryptoGram {

    // Define a public constant for our token type
    pub let CryptoGramToken: Type

    // Define a public field for the admin account
    access(all) let admin: Address

    // Define a public field for the Chainlink oracle account 
    access(all) let oracle: Address

    // Define a struct that represents a video 
    pub struct Video {
      pub let id: UInt64 
      pub let hash: String 
      pub let title: String 
      pub let description: String 
      pub let location: String 
      pub let category: String 
      pub let thumbnailHash: String 
      pub let date: String 
      pub let author: Address 

      init(
          id: UInt64,
          hash: String,
          title: String,
          description: String,
          location: String,
          category: String,
          thumbnailHash: String,
          date: String,
          author: Address) {
            pre {
              // Require valid parameters 
              hash.length > 0 && title.length > 0 && author != nil:
                "Invalid parameters"
            }
            self.id = id 
            self.hash = hash 
            self.title = title 
            self.description = description 
            self.location = location 
            self.category = category 
            self.thumbnailHash = thumbnailHash 
            self.date = date 
            self.author = author 
      }
    }

    // Define a public event that is emitted when a video is uploaded 
    pub event VideoUploaded(
        id: UInt64,
        hash: String,
        title: String,
        description: String,
        location: String,
        category: String,
        thumbnailHash: String,
        date: String,
        author: Address
    )

    // Initialize a new CryptoGramToken resource and save it to storage 
    init(name: String, symbol: String, decimals: UInt8, initialSupply: UFix64) {

        // Set the admin account as the current signer 
        self.admin = AuthAccount(payer: signer)

        // Create a new CryptoGramToken resource 
        let token <- create CryptoGramToken(
            name: name,
            symbol: symbol,
            decimals: decimals,
            initialSupply: initialSupply
        )

        // Save it to the admin account's storage 
        self.admin.save(<-token, to: /storage/CryptoGramToken)

        // Create a public capability for the token that implements FungibleToken.Provider 
        self.admin.link<&CryptoGramToken>(/public/CryptoGramTokenProvider, target: /storage/CryptoGramToken)

        // Set our token type to CryptoGramToken 
        CryptoGram.CryptoGramToken = CryptoGramToken

        // Set the Chainlink oracle account as the one that has the Chainlink contract 
        self.oracle = 0x8d0e87b65159ae63

        // Create an empty dictionary of videos and save it to storage
        let videos <- {}
        self.admin.save(<-videos, to: /storage/Videos)
    }

    // Mint new tokens and deposit them to an account 
    pub fun mintTokens(amount: UFix64, recipient: Address) {

        // Only the admin account can mint new tokens 
        pre {
            recipient == self.admin:
                "Unauthorized to mint tokens"
        }

        // Get the admin's token from storage 
        let tokenRef = self.admin.borrow<&CryptoGramToken>(from: /storage/CryptoGramToken)
            ?? panic("Missing or mis-typed CryptoGramToken")

        // Mint new tokens by withdrawing them from the token 
        let vault <- tokenRef.withdraw(amount: amount)

        // Get the recipient's public account object 
        let recipient = getAccount(recipient)

        // Get the recipient's deposit capability using their CryptoGramTokenProvider 
        let receiverRef = recipient.getCapability(/public/CryptoGramTokenProvider)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Missing or mis-typed CryptoGramToken receiver")

        // Deposit the tokens to the recipient's account 
        receiverRef.deposit(from: <-vault)
    }

    // Upload a new video and save it to storage
    pub fun uploadVideo(
      hash: String,
      title: String,
      description: String,
      location: String,
      category: String,
      thumbnailHash: String,
      date: String) {

      // Get the signer's address
      let author = AuthAccount(payer: signer).address

      // Get the videos dictionary from storage
      let videosRef = self.admin.borrow<&{String: Video}>(from: /storage/Videos)
          ?? panic("Missing or mis-typed Videos")

      // Generate a unique ID for the video
      let id = UInt64(videosRef.length + 1)

      // Create a new video struct
      let video = Video(
          id: id,
          hash: hash,
          title: title,
          description: description,
          location: location,
          category: category,
          thumbnailHash: thumbnailHash,
          date: date,
          author: author
      )

      // Save the video to the dictionary by its hash
      videosRef[hash] <-! video

      // Emit an event for the video upload
      emit VideoUploaded(
          id: id,
          hash: hash,
          title: title,
          description: description,
          location: location,
          category: category,
          thumbnailHash: thumbnailHash,
          date:date,  
          author :author
      )
    }

    // Tip an amount of tokens to a video author and convert it to USD using Chainlink Data Feeds
    pub fun tipVideoAuthor(videoHash :String, amount :UFix64) {

      // Get the videos dictionary from storage
      let videosRef = self.admin.borrow<&{String :Video}>(from :/storage/Videos)
          ?? panic("Missing or mis-typed Videos")
     // Get the video by its hash
      let video = videosRef[videoHash]
          ?? panic("Invalid video hash")

      // Get the video author's address
      let author = video.author

      // Get the admin's token from storage 
      let tokenRef = self.admin.borrow<&CryptoGramToken>(from: /storage/CryptoGramToken)
          ?? panic("Missing or mis-typed CryptoGramToken")

      // Tip tokens by withdrawing them from the token 
      let vault <- tokenRef.withdraw(amount: amount)

      // Get the author's public account object 
      let authorAccount = getAccount(author)

      // Get the author's deposit capability using their CryptoGramTokenProvider 
      let receiverRef = authorAccount.getCapability(/public/CryptoGramTokenProvider)
          .borrow<&{FungibleToken.Receiver}>()
          ?? panic("Missing or mis-typed CryptoGramToken receiver")

      // Deposit the tokens to the author's account 
      receiverRef.deposit(from: <-vault)

      // Get the Chainlink oracle's public account object
      let oracleAccount = getAccount(self.oracle)

      // Get the Chainlink data feed capability using their DataFeedProvider
      let dataFeedRef = oracleAccount.getCapability(/public/DataFeedProvider)
          .borrow<&{Chainlink.DataFeed}>()
          ?? panic("Missing or mis-typed Chainlink data feed")

      // Get the latest ETH/USD price from Chainlink Data Feeds
      let price = dataFeedRef.latestAnswer()

      // Convert the tip amount from wei to USD
      let tipAmountUSD = (price * amount) / 10**18

    }
}