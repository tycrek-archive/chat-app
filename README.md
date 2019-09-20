# chat-app
Privacy &amp; security focused messaging for the masses.

[Trello board](https://trello.com/b/yUqiSo7C/chat-app)

## Index

* [About](#about)
  * [Goals](#goals)
  * [Official support](#official-support)
    * [Browsers](#browsers)
    * [Operating systems](#operating-systems)
    * [Other](#other)
  * [Technology](#technology)
* [Security](#security)
  * [Passwords](#passwords)
    * [Requirements](#requirements)
    * [Transport and storage](#transport-and-storage)
    * [Password saving](#password-saving)
  * [E2EE](#e2ee)
  * [MFA](#mfa)
  * [Privacy](#privacy)
    * [User data](#user-data)
    * [5, 9, 14 eyes](#5-9-14-eyes)

## About

**Chat-app** (a better name is in the works) is meant to be a **secure messaging/communication service** that anyone can use. All the heavy lifting of setting up secure chats is done automatically, while also allowing advanced users to set up many things themselves.

I started this project because I am tired of trying to get people to switch to other secure messaging apps. People don't want to switch because it is "too confusing" and they don't know how to set it up. This project aims to fix by being as secure as possible behind the scenes, while being hassle-free and user-friendly across all platforms (browser and native apps for all platforms and architectures). For most people, this project is a fast, feature-rich messaging app with security as a bonus. For people like myself, it is a highly secure messaging app with extra features as a bonus.

Based on past experience trying to "convert" people to being secure online, I've noticed some things that are common deal-breakers for them:

- **Bad interface**. A bad UI can easily turn people away.
- **Too confusing**. Most secure chat apps aren't "gentle" enough. People are already skeptical about switching to a new app to talk with people and having lot's of technical jargon at them can be intimidating.
- **No one else I know uses it**. This is why it is primarily branded as a "messaging app" instead of a "secure communication app". The majority of people would be more willing to check out a simple messaging app, which would make it easier for more people to adopt it.
- **It doesn't work on X platform**. Compatibility is a huge problem. Many apps don't also have a browser option, so people who have an old device that may not support the app are left in the dark. This project aims to reach as many platforms and architectures as possible.

### Goals

In order for people to *actually* use it, I'm aiming to accomplish these goals.

Goals for non-security/privacy focused users:

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

Goals for security/privacy focused people (such as myself):

- [ ] Strong password encryption
- [ ] End-to-end encryption
- [ ] Multi-factor authentication

Goals for myself:

- [ ] people are interested in it
- [ ] people are using it
- [ ] people enjoy using it

### Official Support

A major aim of this project is to support as many devices as possible. This is a list of places I hope will be supported, either officially or by the community. Checkboxes will be marked once a platform has been tested and confirmed working.

#### Browsers

Webapps for both desktop and mobile.

- Google Chrome
- Mozilla Firefox
- Opera
- Microsoft Edge (current and Chromium beta)
- Internet Explorer (limited, desktop only)

#### Operating systems

In addition to webapps, I also hope to provide native apps for many platforms.

##### Mobile

- [ ] Android
- [ ] iOS

##### Microsoft Windows

- [ ] XP
- [ ] Vista
- [ ] 7
- [ ] 8
- [ ] 8.1
- [ ] 10
- [ ] Windows RT (ARM)

##### Apple macOS

- [ ] 10.8 Mountain Lion
- [ ] 10.9 Mavericks
- [ ] 10.10 Yosemite
- [ ] 10.11 El Capitan
- [ ] 10.12 Sierra
- [ ] 10.13 High Sierra
- [ ] 10.14 Mojave
- [ ] 10.15 Catalina (no 32-bit support)

##### Linux

- RPM
  - [ ] CentOS
  - [ ] openSUSE
- Debian
  - [ ] Kali Linux
  - [ ] PureOS
  - [ ] Ubuntu
  - [ ] elementary OS
  - [ ] Raspbian (ARM)
  - [ ] Damn Small Linux
- Pacman
  - [ ] Arch Linux
  - [ ] Manjaro
- Gentoo
  - [ ] Chrome OS

#### Others

- Browser extensions
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Firefox (pre-Quantum)
- Command line
  - [ ] Windows
  - [ ] macOS
  - [ ] Linux

### Technology

#### Servers and databases

As of right now, the server software is being tested on my personal DigitalOcean Droplet. The databse is a PostgreSQL database also hosted by DigitalOcean. Both the server and database are located in the DigitalOcean Toronto datacenter. For privacy reasons, I do hope to move these to other providers (in other countries) in the future, but right now doing so is not affordable.

## Security

I plan to make this project as secure as possible, while also being as transparent as possible. Any security or privacy features I implement will be listed here, as well as any disclaimers.

### Passwords

Password security is a huge deal. Password requirements are validated on both the client and the server when creating an account, just in case someone tries to exploit the front-end or API.

#### Requirements

- Minimum 12 characters
- at least 2 of each:
  - lowercase
  - uppercase
  - number
  - symbol

*The minimum of two of each may change.*

#### Transport and storage

The API and all browser endpoints are **encrypted with HTTPS** (Let's Encrypt certificate). On account creation or sign-in, passwords are encoded in Base64 client-side and decoded back to plain text server-side. This is **not** a security feature, rather it is a way of ensuring passwords with symbols don't get screwed up during transport.

The server uses the popular **Bcrypt hashing** algorithm to hash passwords with **10 rounds of salt**. I have plans to increase this to 12, but right now my laptop takes too long.

Plain text passwords are **never** stored by the server. The only interaction the server ever has with the plain text password is decoding it from Base64 and passing it to the hashing function. Once hashed, the hash is stored in a PostgreSQL database.

The authentication table in the database is titled `users`. This table includes three columns:

- `name` (username used to sign in)
- `uuid` (UUIDv4 to identify a user)
- `hash` (hash of the users password)

Any other user data is stored in a separate table and referenced with the UUID.

#### Password "saving"

It is extremely common for users to enable "password saving" in their browsers. There really isn't any way to prevent this.

On mobile devices, if a user wants to save their password, they will be permitted to do so as it can then be encrypted using the devices encrypted keystore.

### E2EE

Messages between users will be **end-to-end encrypted**. I'm still researching how to best implement E2EE. Group chats will be especially difficult to encrypt due to how many users can be in them (and new users can be dynamically added).

For non-advanced users, a private/public keypair will be automatically generated for them. Advanced users can provide their own keypairs if they wish, but they must ensure the private key is password protected.

Multi-device support is going to be tricky. I have two ideas:

1. A new keypair is generated for each device. When User A sends a message, multiple copies of that message are created and encrypted by each of User B's public keys. Then, when User B logs into a device, the device specific copy of that message is sent and decrypted using that devices private key. The main downside with this is when a user has many devices, encrypting the message could take a lot longer and the database size increases much faster.
2. A user has a single keypair for their entire account. The private key is password protected using the users password and stored server side. When the user logs in to a device, the encrypted private key is sent to them. Any encrypted messages are decrypted using the private key which is unlocked with the password. The user will not have to enter the password every time: as long as they are signed in, the password will be cached or saved (not on the disk).

### MFA

Multi-factor/two-factor authentication (MFA/2FA) will be displayed when a new user is creating their account. The prompt will have very user-friendly explanation of how MFA works and why it is *highly* recommended. However, it will not be forced on the user. There will be a clearly visible button shown at all times if the user wants to skip MFA setup. They will be prompted once more to confirm if they want to skip.

I hope to have support for a variety of MFA technologie, such as OTP and physical hardware keys.

### Privacy

Another main focus of this project is privacy. This is **not** a social network. It is simply a means of communication. There is **no** way to search for a user by name: you have to add them by their exact username (and there is no confirmation if that username doesn't exist). The other user then has to confirm or deny you adding them. You will only receive a confirmation if they accept.

#### User data

Probably the number one reason why I started this project is to get away from needing to use Instagram for messages. Instagram is owned by Facebook and when it comes to privacy, well... Facebook is a bit lacking. This section (titled **User data**) is the entire privacy policy for this project.

##### Definitions

- *app* *project*, and *service* refer to this entire project and every aspect of it.
- *we*, *us*, *I*, and other terms refer to **me**, Josh Moore.
- *you* refers to ***you***, the person reading this.
- *other users* refers to any other person using the service.
- *required data* is information that is needed for someone to use the service. Users can request this information be removed, however, doing so will permanantly delete their account and all other data associated with it.
- *optional data* is information that is provided by the user should they want to enable or use extra features. Optional data can be removed at any time per user request, no-questions-asked. Data is permanantly deleted from the server when removal is requested (removal is as simple as deleting word from your profile).

##### What data is collected?

Required data includes:

- **username** - Used to sign in. Can be nearly anything. Does **not** need to be an email.
- **password** - Used to sign in. Passwords are encrypted on the server; I never have access to your plain-text password.

Optional data:

- **display name** - A "friendly name" displayed to other users in chats. For example: if a users username is "johna95", their display name could be "John Appleseed". Display name does not necessarily need to be a name, it is simply a secondary way for other users to identify you.
- **profile photo** - A photo uploaded to your account to help other users identify you. This can be removed at any time.
- **email address/phone number** - While optional, one of these is recommended. These are used for a variety of reasons:
  - account recovery if you forget your password
  - a method of MFA

##### What happens to this data? Is it sold to third-parties?

Any user information or data is **never** sold to outside companies. *As of writing*, no one other than myself (Josh Moore) has access to the database.

##### Can I delete my data?

**Yes**. Any and all information related to your account can be removed or permanantly deleted.

**This includes messages**! When you delete your account, your public and private keys are deleted as well, which in turn will delete any messages encrypted by them. This isn't a side effect of bad code, this is done **by choice**.

#### 5, 9, 14 eyes

These are countries that I really hope to *avoid* having servers in.

- 5 eyes
  - United States
  - Canada
  - United Kingdom
  - Australia
  - New Zealand
- 9 eyes
  - Denmark
  - Drance
  - Netherlands
  - Norway
- 14 eyes
  - Germany
  - Belgium
  - Italy
  - Sweden
  - Spain