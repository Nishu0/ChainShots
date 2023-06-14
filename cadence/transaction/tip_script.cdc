// flowContract.cdc

import FlowMeiumContract from 0x909fa9dc860f58fc
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import FIND from 0x35717efbbce11c74
import Dandy from 0x35717efbbce11c74
import Profile from 0x35717efbbce11c74
import FindMarket from 0x35717efbbce11c74
import FindMarketDirectOfferSoft from 0x35717efbbce11c74
import DapperUtilityCoin from 0x82ec283f88a62e65
import FlowUtilityToken from 0x82ec283f88a62e65
import FindLeaseMarketDirectOfferSoft from 0x35717efbbce11c74
import FindLeaseMarket from 0x35717efbbce11c74

transaction(authorAdd: Address, postID: UInt64, price: UFix64) {
  prepare(acct: AuthAccount) {
    if acct.borrow<&FlowMeiumContract.Collection>(from: FlowMeiumContract.CollectionStoragePath) == nil {
      acct.save<@NonFungibleToken.Collection>(<-FlowMeiumContract.createEmptyCollection(), to: FlowMeiumContract.CollectionStoragePath)
      acct.link<&{FlowMeiumContract.CollectionPublic}>(FlowMeiumContract.CollectionPublicPath, target: FlowMeiumContract.CollectionStoragePath)
    }
    
    let authorAcc = getAccount(authorAdd)
    let capability = authorAcc.getCapability<&{FlowMeiumContract.PostCollectionPublic}>(FlowMeiumContract.PostCollectionPublicPath)

    // borrow a reference from the capability
    let publicRef = capability.borrow() ?? panic("Could not borrow reference to the owner's CollectionPublic")

    let recepCap = acct.getCapability<&{FlowMeiumContract.CollectionPublic}>(FlowMeiumContract.CollectionPublicPath)

    let vaultRef = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)

    let temporaryVault: @FungibleToken.Vault <- vaultRef!.withdraw(amount: price)

    publicRef.purchasePost(postID: postID, recipient: recepCap, buyTokens: <- temporaryVault)
  }
}
