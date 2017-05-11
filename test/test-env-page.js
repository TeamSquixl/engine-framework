require('../src');

describe('Environment Variables', function() {
    it('Fire.isCoreLevel should be false', function() {
        expect(Fire.isCoreLevel).to.be.false;
    });
    it('Fire.isNode should be true', function() {
        expect(Fire.isNode).to.be.true;
    });
    it('Fire.isAtomShell should be true', function() {
        expect(Fire.isAtomShell).to.be.true;
    });
    it('FIRE_EDITOR should be true', function() {
        expect(FIRE_EDITOR).to.be.true;
    });
    it('FIRE_TEST should be true', function() {
        expect(FIRE_TEST).to.be.true;
    });
});
