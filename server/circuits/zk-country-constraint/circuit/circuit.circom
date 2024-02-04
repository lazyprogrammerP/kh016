pragma circom 2.0.0;
include "../../../node_modules/circomlib/circuits/comparators.circom";

template CountryRestriction() {
    signal input countries[5]; // public: 5 countries' 3-lettered ISO names
    signal input country; // private

    signal output out; // true/false

    component isEqual[5];
    signal sanctioned;

    for(var i = 0; i < 5; i++){
        isEqual[i] = IsEqual(); 
        isEqual[i].in[0] <== country;
        isEqual[i].in[1] <== countries[i];
    }

    // Use a circuit-based approach to check if the country is sanctioned
    // Sum up all the outputs of the isEqual components
    sanctioned <== isEqual[0].out + isEqual[1].out + isEqual[2].out + isEqual[3].out + isEqual[4].out;

    // If sanctioned is 0, then out should be 1, meaning the country is not in the list
    out <== 1 - sanctioned; // Assuming IsEqual outputs are 0 or 1
}

component main = CountryRestriction();