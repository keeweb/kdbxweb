Release notes
-------------
##### v2.1.1 (2021-09-06)
`-` updated dependencies

##### v2.1.0 (2021-06-17)
`-` replaced `pako` with `fflate` to reduce bundle size  

##### v2.0.5 (2021-05-25)
`-` writable `passwordHash` and `keyFileHash` credentials properties  

##### v2.0.4 (2021-05-19)
`-` fixed saving KDBX3 files without compression  

##### v2.0.3 (2021-05-14)
`-` fixed a crash in Electron when KDBX3 contains large attachments  

##### v2.0.2 (2021-05-10)
`+` exposed `ProtectedValue.salt` and `ProtectedValue.value`  
`+` new static method: `ProtectedValue.fromBase64`
`+` new instance method: `ProtectedValue::toBase64`  

##### v2.0.1 (2021-05-08)
`+` added `passwordHash` and `keyFileHash` to credentials  

##### v2.0.0 (2021-05-08)
`*` the library rewritten in TypeScript  
`*` dist files removed from the repo  
`*` browser support limited to two latest versions  
`*` `Random` removed, use `CryptoEngine.random` instead  
`*` creating `KdbxUuid` with bad values produces an error  
`*` all library modules added to exports  
`*` underscore removed from 'private' class methods  
`*` some object exports replaced with ES6 exports  
`*` binaries interface changed completely, see kdbx-binary.js  
`*` replaced `forEach` with `*allItems` `*allGroups` `*allEntries`    
`*` `object {}` => `Map<>`: `*.customData`, `meta.customIcons`, `entry.fields`, `entry.binaries`  
`*` KDBX 4.1 support  
`*` custom icons contain name and lastModified when possible  
`*` error for files with too high minor version  

##### v1.14.4 (2021-03-19)
`*` cleaning up kdbx.xml after save to save memory

##### v1.14.3 (2021-03-19)
`*` cleaning up kdbx.xml after load to save memory

##### v1.14.2 (2021-02-01)
`-` fixed setting KDF to Argon2id  

##### v1.14.1 (2020-12-31)
`-` fixed new lines removal in non-encoded fields  

##### v1.14.0 (2020-12-30)
`-` fixed parsing xml with bad characters  

##### v1.13.0 (2020-12-09)
`+` possibility to generate a V2 keyfile  
`*` createRandomKeyFile returns a promise  

##### v1.12.1 (2020-12-07)
`+` relaxed keyfile version checking  

##### v1.12.0 (2020-12-07)
`+` V2 keyfiles support  

##### v1.11.0 (2020-12-03)
`+` Argon2id support  

##### v1.10.0 (2020-09-12)
`-` fixed KeyEncryptionRounds header field data type  
`-` missing polyfill added for old Edge versions  

##### v1.9.0 (2020-06-04)
`*` removed text-encoding polyfill  
`+` development: eslint  
`+` development: prettier  

##### v1.8.0 (2020-06-02)
`*` default format changed to KDBX4  

##### v1.7.1 (2020-05-31)
`+` fixed empty icon not understood by other clients  

##### v1.7.0 (2020-05-31)
`+` fixed empty auto-type obfuscation setting not understood by other clients  

##### v1.6.0 (2020-04-10)
`+` challenge-response keys support  

##### v1.5.8 (2020-03-15)
`+` fixed historyMaxItems for 0 and -1  

##### v1.5.7 (2019-12-01)
`+` fixed minor version for v4 files  

##### v1.5.6 (2019-10-26)
`+` generating missing ids while reading files  

##### v1.5.5 (2019-10-04)
`-` fixed another bug in importing entries  

##### v1.5.4 (2019-10-04)
`-` fixed importing entries  

##### v1.5.3 (2019-09-24)
`-` fix #26: library usage issues in node.js  

##### v1.5.2 (2019-09-22)
`-` removed a leaked dependency  

##### v1.5.1 (2019-09-22)
`-` fixed a bug in importing attachments  

##### v1.5.0 (2019-09-22)
`+` importing entries from other files using `Kdbx.importEntry`  
`*` debug and release versions are now provided: kdbxweb.js and kdbxweb.min.js  

##### v1.4.2 (2019-09-14)
`+` default encryption rounds increased to 300000  

##### v1.4.1 (2019-09-14)
`+` setting file KDF with `kdbx.setKdf`  

##### v1.4.0 (2019-09-14)
`+` setting file version with `kdbx.setVersion`  

##### v1.3.0 (2019-09-08)
`-` pretty-printing xml option in `Kdbx::saveXml`  

##### v1.2.7 (2019-03-06)
`-` fixed header after upgrade to kdbx4  

##### v1.2.6 (2018-12-19)
`*` performance improvement  

##### v1.2.5 (2018-11-10)
`+` removed usages of obsolete Buffer() constructor  

##### v1.2.4 (2018-07-13)
`+` fixed large attachments error: keeweb/keeweb#922  

##### v1.2.3 (2018-03-29)
`+` throw an error if there's not enough data in a file  

##### v1.2.2 (2018-03-03)
`+` copyright year updated  

##### v1.2.1 (2018-03-03)
`+` support AES KDF in KDBX4  

##### v1.2.0 (2018-03-03)
`!` dropped IE support  

##### v1.1.0 (2018-02-14)
`+` support ChaCha2 in KDBX3  

##### v1.0.2 (2017-09-29)
`-` improved decoding performance, fix #17  

##### v1.0.1 (2017-02-27)
`-` fix opening db with empty binaries  

##### v1.0.0 (2017-02-01)
`+` KDBX4 support  
`!` API updated  

##### v0.4.6 (2016-08-23)
`-` fix keyfiles with bom  

##### v0.4.5 (2016-08-21)
`+` support raw 32-byte and hex 64-byte keyfiles  

##### v0.4.4 (2016-08-16)
`-` fix keyfiles with unicode characters  

##### v0.4.3 (2016-07-30)
`-` index bugfix for v4.0.2  

##### v0.4.2 (2016-07-30)
`+` target index argument in move function  

##### v0.4.1 (2016-04-21)
`-` fixed bug in Firefox  

##### v0.4.0 (2016-04-21)
`!` xmldom is now external dependency  
`-` updated xmldom to patched version without encoder bug  

##### v0.3.11 (2016-04-10)
`-` create recycle bin if it's enabled but not yet created   

##### v0.3.10 (2016-04-03)
`-` Fixed random keyfile generator  

##### v0.3.8 (2016-03-04)
`+` Expose Kdbx.Consts.Signatures  

##### v0.3.7 (2016-03-04)
`-` Preserve empty fields in entries  

##### v0.3.6 (2016-03-01)
`+` Kdbx.loadXml  

##### v0.3.5 (2016-02-26)
`+` Allow to open db with empty password and keyfile  
`+` Using secure random generator if it's available  

##### v0.3.4 (2016-02-14)
KdbxCredentials.createKeyFileWithHash  

##### v0.3.3 (2015-12-17)
Binaries management  

##### v0.3.2 (2015-12-13)
ASCII-only dist  

##### v0.3.1 (2015-12-02)
Version fix  

##### v0.3.0 (2015-12-02)
Merge  
`+` Kdbx.merge  
`+` Kdbx.[get,set,remove]LocalEditState  
`+` KdbxEntry.removeHistory  
`+` KdbxGroup.forEach now accepts thisArg  

##### v0.2.6 (2015-11-22)
Custom icons cleanup  

##### v0.2.6 (2015-11-21)
History cleanup method  

##### v0.2.5 (2015-11-10)
Fixed KeePassX compatibility bugs  

##### v0.2.4 (2015-11-09)
`+` Export Uuid  
`-` Fix entry history write bug  

##### v0.2.3 (2015-11-07)
Support DeletedObjects  

##### v0.2.2 (2015-11-06)
Build fix  
`-` fixed node.js install issues  

##### v0.2.1 (2015-11-04)
API conststency  
`+` entry.parentGroup, group.parentGroup  
`!` Kdbx.move, Kdbx.remove now doesn't require parent group  

##### v0.2.0 (2015-11-04)
WebCrypto support  
`!` Kdbx.load, Kdbx.save, Kdbx.saveXml are now async  

##### v0.1.12 (2015-11-02)
Ability to use binary keyfiles  

##### v0.1.11 (2015-10-24)
Allow to change password and keyfile  

##### v0.1.9 (2015-10-22)
Fixed loading in nodejs  

##### v0.1.8 (2015-10-17)
Save as XML  

##### v0.1.7 (2015-10-17)
Entry creation bug fixed  

##### v0.1.6 (2015-10-11)
Move/delete entries/groups  

##### v0.1.5 (2015-10-11)
Creation of groups and entries  

##### v0.1.4 (2015-09-27)
Entry copy method  

##### v0.1.3 (2015-09-19)
Loader bug fixed  

##### v0.1.2 (2015-09-19)
Key processing speedup  

##### v0.1.1 (2015-09-06)
More exports  

##### v0.1.0 (2015-08-22)
First public beta  
