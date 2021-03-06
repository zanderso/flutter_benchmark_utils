// Copyright 2020 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

base64_char_table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
base64_reverse_table = null;

function base64MakeReverseTable() {
  if (base64_reverse_table) return;
  base64_reverse_table = new Array(256);
  var val = 0;
  for (var i = 0; i < base64_char_table.length; i++) {
    var ch = base64_char_table.charCodeAt(i);
    base64_reverse_table[ch] = val++;
  }
}

function base64StringToBuffer(base64_string) {
  base64MakeReverseTable();

  var str_len = base64_string.length;
  while (str_len > 0 && base64_string[str_len - 1] == '=') str_len--;

  var uIntArray = new Uint8Array(str_len * 6 / 8);
  var uIndex = 0;
  for (var i = 0; i < str_len; i += 4) {
    var b64_0 = base64_reverse_table[base64_string.charCodeAt(i)];
    var b64_1 = base64_reverse_table[base64_string.charCodeAt(i + 1)];
    var b64_2 = base64_reverse_table[base64_string.charCodeAt(i + 2)];
    var b64_3 = base64_reverse_table[base64_string.charCodeAt(i + 3)];

    var all_bits = (b64_0 << 18) | (b64_1 << 12) | (b64_2 << 6) | (b64_3 << 0);

    uIntArray[uIndex++] = (all_bits >> 16) & 0xff;
    if (uIndex < uIntArray.length) uIntArray[uIndex++] = (all_bits >> 8) & 0xff;
    if (uIndex < uIntArray.length) uIntArray[uIndex++] = all_bits & 0xff;
  }
  return uIntArray;
}

function base64BufferToString(uIntArray) {
  var arrLen = uIntArray.length;
  var strLen = parseInt((arrLen + 2) / 3) * 4;
  var str = '';

  var bits = 0;
  var numBits = 0;
  var arrIndex = 0;
  while (arrIndex < arrLen || numBits > 0) {
    if (numBits < 6) {
      while (numBits <= 24 && arrIndex < arrLen) {
        bits |= (uIntArray[arrIndex++] << (24 - numBits));
        numBits += 8;
      }
    }
    str += base64_char_table[bits >>> 26];
    bits <<= 6;
    numBits -= 6;
  }
  while ((str.length & 3) != 0) {
    str += '=';
  }
  return str;
}
