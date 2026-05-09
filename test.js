const regex = /^\s*([*_]{1,3})(#{1,6}\s+[\s\S]*?)\1/gm;

console.log('Test 5:', '**## Hey Alex** Some text'.replace(regex, '$2'));
