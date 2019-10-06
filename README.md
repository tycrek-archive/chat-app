# chat-app
Privacy &amp; security focused messaging for the masses.

[Trello board](https://trello.com/b/yUqiSo7C/chat-app)

### Index

* [About](#about)
  * [Features](#features)
  * [Device support](#device-support)
* [Security](#security)
  * [Passwords](#passwords)
  * [Messages](#messages)
  * [Transport](#transport)
  * [MFA](#mfa)
* [End-to-end encryption](#end-to-end-encryption)
  * [Direct messaging](#direct-messaging)
  * [Group messaging](#group-messaging)
* [Why?](#why)

## About

**Chat-app** (a better name is in the works) is a **secure communication service** that anyone can use. All the heavy lifting of setting up secure chats is done automatically, while also allowing advanced users to set things up themselves.

### Features

- Modern UI
  - [ ] Material Design
  - [ ] Smooth animations
  - [ ] Good theme
  - [ ] Dark mode
- Ease of use
  - [ ] No technical jargon
  - [ ] Quick and easy to sign up
  - [ ] Quickly navigate chats without UI quirks
- Multi-device support
  - [ ] iOS and Android apps look and behave identically
  - [ ] App isn't required, but offered (browser webapps)
  - [ ] Progressive webapps (halfway between webapp and native)
- Modern messaging features
  - [ ] "read" receipts
  - [ ] Typing indicators
  - [ ] Group chats
  - [ ] Mute chats
  - [ ] Send photos and videos
  - [ ] Voice/video chat
  - [ ] Expiring messages
- Highly secure and private
  - [x] Strong password encryption
  - [x] End-to-end encryption
  - [ ] Multi-factor authentication

### Device support

#### Browsers

Webapps for both desktop and mobile.

- [ ] Google Chrome
- [ ] Mozilla Firefox
- [ ] Opera
- [ ] Microsoft Edge (current and Chromium beta)
- [ ] Internet Explorer (limited, desktop only)

#### Operating Systems

- [ ] Windows
- [ ] macOS
- [ ] Linux
- [ ] Android
- [ ] iOS

#### Browser extensions

- [ ] Chrome
- [ ] Firefox
- [ ] Firefox (pre-Quantum)

#### Command line

- [ ] Windows
- [ ] macOS
- [ ] Linux

## Security

#### Passwords

Passwords are encrypted using the **Bcrypt hashing algorithm** to hash passwords with **10 rounds of salt**. Plain-text passwords are **not** stored on the server.

Passwords must be a minimum of 10 characters long, be mixed-case, and have a number and a symbol. These requirements are validated both client-side and server-side.

#### Messages

Messages are encrypted using 4096-bit RSA/AES-256-CBC keypairs. They are stored encrypted on the server and are only decrypted on the client.

#### Transport

All endpoints and client/server communication are encrypted with HTTPS.

#### MFA

Multi-factor authentication will be offered for all accounts. I'm hoping to have support for both softare and hardware solutions.

## End-to-end encryption

All messages are **end-to-end encrypted**.

#### Direct messaging

On sign up, **two keypairs** are generated for a user, as well as a unique **unlock key**. The first keypair is protected by the user password and the second is protected by the unlock key. Both keypairs and the encrypted unlock key are stored on the server.

The **second keypair** and **unlock key** are used to decrypt messages for a user. The unlock key is encrypted with the the first keypair and stored server-side. When the user signs in, the client decrypts the unlock key with the first keypair and password. The unlock key is then stored on the client for the duration of the session.

When a message is sent, **two copies** are created. One is encrypted with the senders keypair and the other with the recipients keypair. This lets both users view all previous messages in a conversation.

#### Group messaging

Group messaging will be implemented later on.

## Why?

Modern messaging sucks. I hope to fix that.