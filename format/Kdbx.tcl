# KDBX file template for HexFiend
# https://github.com/keeweb/kdbxweb/blob/master/format/Kdbx.tcl
# MIT license
#
# Format reference: https://keepass.info/help/kb/kdbx_4.html
# HexFiend templates docs: https://github.com/ridiculousfish/HexFiend/tree/master/templates

little_endian

requires 0 "03D9A29A 67FB4BB5"

set version 0

section "Header" {
    uint32 -hex "Magic"
    uint32 -hex "Signature"
    uint16 "Version minor"
    set version [uint16 "Version major"]

    if {$version == 3 || $version == 4} {
        set field 1
        while {![end] && $field != 0} {
            set field [uint8]
            move -1
            if {$field == 0} {
                set field_desc "EndOfHeader"
            } elseif {$field == 1} {
                set field_desc "Comment"
            } elseif {$field == 2} {
                set field_desc "CipherID"
            } elseif {$field == 3} {
                set field_desc "CompressionFlags"
            } elseif {$field == 4} {
                set field_desc "MasterSeed"
            } elseif {$field == 5} {
                set field_desc "TransformSeed"
            } elseif {$field == 6} {
                set field_desc "TransformRounds"
            } elseif {$field == 7} {
                set field_desc "EncryptionIV"
            } elseif {$field == 8} {
                set field_desc "ProtectedStreamKey"
            } elseif {$field == 9} {
                set field_desc "StreamStartBytes"
            } elseif {$field == 10} {
                set field_desc "InnerRandomStreamID"
            } elseif {$field == 11} {
                set field_desc "KdfParameters"
            } elseif {$field == 12} {
                set field_desc "PublicCustomData"
            } else {
                set field_desc "Unknown"
            }
            section "Header field" {
                uint8 "TypeID"
                move -1
                entry "Type" $field_desc 1
                move 1
                if {$version < 4} {
                    set size [uint16 "Data length"]
                } else {
                    set size [uint32 "Data length"]
                }
                hex $size "Data"
                if {$field == 1} {
                    move -$size
                    ascii $size "Comment"
                } elseif {$field == 2} {
                    if {$size == 16} {
                        move -16
                        uuid "Cipher UUID"
                    }
                } elseif {$field == 3} {
                    if {$size == 4} {
                        move -4
                        set compression_flags [uint32 "Compression algorithm ID"]
                        move -4
                        if {$compression_flags == 0} {
                            entry "Compression algorithm" "None" 4
                        } elseif {$compression_flags == 1} {
                            entry "Compression algorithm" "Gzip" 4
                        }
                        move 4
                    }
                } elseif {$field == 6} {
                    if {$size == 8} {
                        move -8
                        uint64 "Transform rounds"
                    }
                } elseif {$field == 11} {
                    section "KDF parameters" {
                        move -$size
                        set dict_version [uint16 -hex "Version"]
                        if {$dict_version == 0x100} {
                            set param_type 1
                            while {![end] && $param_type != 0} {
                                section "Parameter" {
                                    set param_type [uint8 "TypeID"]
                                    if {$param_type == 0} {
                                        set param_desc "End"
                                    } elseif {$param_type == 0x04} {
                                        set param_desc "UInt32"
                                    } elseif {$param_type == 0x05} {
                                        set param_desc "UInt64"
                                    } elseif {$param_type == 0x08} {
                                        set param_desc "Bool"
                                    } elseif {$param_type == 0x0C} {
                                        set param_desc "Int32"
                                    } elseif {$param_type == 0x0D} {
                                        set param_desc "Int64"
                                    } elseif {$param_type == 0x18} {
                                        set param_desc "String"
                                    } elseif {$param_type == 0x42} {
                                        set param_desc "Bytes"
                                    } else {
                                        set param_desc "Unknown"
                                    }
                                    move -1
                                    entry "Type" $param_desc 1
                                    move 1
                                    if {$param_type != 0} {
                                        set key_length [uint32 "Key length"]
                                        ascii $key_length "Key"
                                        set value_length [uint32 "Value length"]
                                        hex $value_length "Value"
                                        if {$param_type == 0x04 && $value_length == 4} {
                                            move -4
                                            uint32 "UInt32"
                                        } elseif {$param_type == 0x05 && $value_length == 8} {
                                            move -8
                                            uint64 "UInt64"
                                        } elseif {$param_type == 0x08 && $value_length == 1} {
                                            move -1
                                            int8 "Bool"
                                        } elseif {$param_type == 0x0C && $value_length == 4} {
                                            move -4
                                            int32 "Int32"
                                        } elseif {$param_type == 0x0D && $value_length == 8} {
                                            move -8
                                            int64 "Int64"
                                        } elseif {$param_type == 0x18} {
                                            move -$value_length
                                            ascii $value_length "String"
                                        }
                                    }
                                }
                            }
                        } else {
                            move -2
                            move $size
                        }
                    }
                }
            }
        }
    } else {
        entry "Error" "Unexpected version, supported: 3 or 4"
    }
}

if {$version == 3} {
    bytes eof "Encrypted data"
} elseif {$version == 4} {
    hex 32 "Header SHA256"
    hex 32 "Header HMAC"
    bytes eof "Encrypted data"
}
