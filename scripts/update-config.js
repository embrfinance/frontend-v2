var path = require('path');
var fs = require('fs');
var network = process.argv[2] || 'docker-parity';
var networkCamelcase = process.argv[2] || 'dockerParity';
function contractAddress(contractName) {
    var contractArtifactPath = path.resolve(__dirname, '../../core/deployments/artifacts/' + networkCamelcase + '/' + contractName + '.json');
    var file = fs.readFileSync(contractArtifactPath, 'utf8');
    var json = JSON.parse(file);
    return json.address;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
var jsonConfigFilePath = path.resolve(__dirname, '../src/lib/utils/balancer/configs/' + network + '.json');
var doc = JSON.parse(fs.readFileSync(jsonConfigFilePath, 'utf8'));
Object.entries(doc).forEach(function (_a) {
    var contractName = _a[0], address = _a[1];
    try {
        var address_1 = contractAddress(capitalizeFirstLetter(contractName));
        doc[contractName] = address_1;
    }
    catch (err) {
        var msg = 'Cannot find ' + network + ' contract artifacts for ' + contractName + ' - missing deployment artifacts?';
        console.log(msg);
    }
});
fs.writeFile(jsonConfigFilePath, JSON.stringify(doc, null, 2), function (err) {
    if (err) {
        console.log(err);
    }
});
