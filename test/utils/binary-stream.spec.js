'use strict';

var expect = require('expect.js'),
    BinaryStream = require('../../lib/utils/binary-stream');

describe('BinaryStream', function() {
    var arr = new Uint8Array(100);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = i;
    }
    var view = new DataView(arr.buffer);

    it('provides basic int and float getters available in DataView', function() {
        var stm = new BinaryStream(arr.buffer);
        expect(stm.getUint8()).to.be(view.getUint8(0, false));
        expect(stm.getUint8(true)).to.be(view.getUint8(1, true));
        expect(stm.getInt8()).to.be(view.getInt8(2, false));
        expect(stm.getInt8(true)).to.be(view.getInt8(3, true));
        expect(stm.getUint16()).to.be(view.getUint16(4, false));
        expect(stm.getUint16(true)).to.be(view.getUint16(6, true));
        expect(stm.getInt16()).to.be(view.getUint16(8, false));
        expect(stm.getInt16(true)).to.be(view.getUint16(10, true));
        expect(stm.getUint32()).to.be(view.getUint32(12, false));
        expect(stm.getUint32(true)).to.be(view.getUint32(16, true));
        expect(stm.getInt32()).to.be(view.getUint32(20, false));
        expect(stm.getInt32(true)).to.be(view.getUint32(24, true));
        expect(stm.getFloat32()).to.be(view.getFloat32(28, false));
        expect(stm.getFloat32(true)).to.be(view.getFloat32(32, true));
        expect(stm.getFloat64()).to.be(view.getFloat64(36, false));
        expect(stm.getFloat64(true)).to.be(view.getFloat64(44, true));
    });

    it('gets uint64', function() {
        var stm = new BinaryStream(arr.buffer);
        expect(stm.getUint64()).to.be(0x0001020304050607);
        expect(stm.getUint8()).to.be(8);
        stm = new BinaryStream(arr.buffer);
        expect(stm.getUint64(true)).to.be(0x0706050403020100);
        expect(stm.getUint8()).to.be(8);
    });

    it('provides basic int and float setters available in DataView', function() {
        var tmpArr = new Uint8Array(100);
        var stm = new BinaryStream(tmpArr.buffer);
        stm.getUint8(view.getUint8(0, false));
        stm.setUint8(view.getUint8(1, true), true);
        stm.setInt8(view.getInt8(2, false));
        stm.setInt8(view.getInt8(3, true), true);
        stm.setUint16(view.getUint16(4, false));
        stm.setUint16(view.getUint16(6, true), true);
        stm.setInt16(view.getUint16(8, false));
        stm.setInt16(view.getUint16(10, true), true);
        stm.setUint32(view.getUint32(12, false));
        stm.setUint32(view.getUint32(16, true), true);
        stm.setInt32(view.getUint32(20, false));
        stm.setInt32(view.getUint32(24, true), true);
        stm.setFloat32(view.getFloat32(28, false));
        stm.setFloat32(view.getFloat32(32, true), true);
        stm.setFloat64(view.getFloat64(36, false));
        stm.setFloat64(view.getFloat64(44, true), true);
        expectArrayBuffersEqual(tmpArr.buffer.slice(0, 52), arr.buffer.slice(0, 52));
    });

    it('sets uint64', function() {
        var tmpArr = new Uint8Array(9);
        var stm = new BinaryStream(tmpArr.buffer);
        stm.setUint64(0x0001020304050607);
        stm.setUint8(8);
        expectArrayBuffersEqual(tmpArr.buffer, arr.buffer.slice(0, 9));
        tmpArr = new Uint8Array(9);
        stm = new BinaryStream(tmpArr.buffer);
        stm.setUint64(0x0706050403020100, true);
        stm.setUint8(8);
        expectArrayBuffersEqual(tmpArr.buffer, arr.buffer.slice(0, 9));
    });

    it('reads bytes after pos', function() {
        var stm = new BinaryStream(arr.buffer);
        var bytes = stm.readBytesToEnd();
        expectArrayBuffersEqual(bytes, arr.buffer);
        bytes = stm.readBytesToEnd();
        expect(bytes.byteLength).to.be(0);

        stm = new BinaryStream(arr.buffer);
        stm.getUint8();
        stm.getFloat64();
        bytes = stm.readBytesToEnd();
        expectArrayBuffersEqual(bytes, arr.buffer.slice(9));
        bytes = stm.readBytesToEnd();
        expect(bytes.byteLength).to.be(0);

        stm = new BinaryStream(arr.buffer);
        for (var i = 0; i < 100; i++) {
            stm.getUint8();
        }
        bytes = stm.readBytesToEnd();
        expect(bytes.byteLength).to.be(0);
    });

    it('reads number of bytes after pos', function() {
        var stm = new BinaryStream(arr.buffer);
        var bytes = stm.readBytes(100);
        expectArrayBuffersEqual(bytes, arr.buffer);
        bytes = stm.readBytesToEnd();
        expect(bytes.byteLength).to.be(0);

        stm = new BinaryStream(arr.buffer);
        stm.getUint8();
        stm.getFloat64();
        bytes = stm.readBytes(50);
        expectArrayBuffersEqual(bytes, arr.buffer.slice(9, 59));
        bytes = stm.readBytesToEnd();
        expect(bytes.byteLength).to.be(41);

        stm = new BinaryStream(arr.buffer);
        for (var i = 0; i < 100; i++) {
            stm.getUint8();
        }
        bytes = stm.readBytes(5);
        expect(bytes.byteLength).to.be(0);
    });

    it('returns position', function() {
        var stm = new BinaryStream(arr.buffer);
        expect(stm.pos).to.be(0);
        stm.getInt8();
        expect(stm.pos).to.be(1);
        stm.readBytesToEnd();
        expect(stm.pos).to.be(100);
    });

    it('returns byteLength', function() {
        var stm = new BinaryStream(arr.buffer);
        expect(stm.byteLength).to.be(arr.buffer.byteLength);
    });

    it('can read bytes without changing position', function() {
        var stm = new BinaryStream(arr.buffer);
        expect(stm.pos).to.be(0);
        var bytes = stm.readBytesNoAdvance(10, 12);
        expect(stm.pos).to.be(0);
        expect(new Uint8Array(bytes)).to.be.eql(new Uint8Array([10, 11]));
    });

    it('can expand length on write', function() {
        var stm = new BinaryStream(new Uint8Array(2).buffer);
        stm._canExpand = true;
        stm.writeBytes(new Uint8Array([0,1,2]));
        stm.setUint8(3);
        stm.writeBytes(new Uint8Array([4]).buffer);
        expect(new Uint8Array(stm.getWrittenBytes())).to.be.eql(new Uint8Array([0,1,2,3,4]));
    });

    it('creates buffer itself and expands it', function() {
        var stm = new BinaryStream();
        stm.writeBytes(new Uint8Array(1021));
        stm.writeBytes(new Uint8Array([0,1,2]));
        stm.setUint8(3);
        stm.writeBytes(new Uint8Array([4]).buffer);
        expect(stm.getWrittenBytes().byteLength).to.be.eql(1026);
    });

    function expectArrayBuffersEqual(ab1, ab2) {
        expect(new Uint8Array(ab1)).to.eql(new Uint8Array(ab2));
    }
});
