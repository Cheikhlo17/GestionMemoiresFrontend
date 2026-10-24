import { isThesisOwner } from './thesis-detail.component';

describe('isThesisOwner', () => {
  it('uses matching stable IDs for a student account', () => {
    expect(isThesisOwner(12, 12, true)).toBeTrue();
  });

  it('does not treat matching names as ownership when IDs differ', () => {
    expect(isThesisOwner(12, 34, true)).toBeFalse();
  });

  it('does not grant student ownership to another role', () => {
    expect(isThesisOwner(12, 12, false)).toBeFalse();
  });
});
