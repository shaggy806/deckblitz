/**
 * Urza's Saga (USG; B198), group E. One test per card whose behaviour is more
 * than a stat line or a copy of a tested pattern, on the clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  keywords,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("Mishra's Helix", () => {
  it("taps X target lands for {X}", () => {
    const { game } = table();
    const helix = spawn(game, "Mishra's Helix");
    lands(game, "Wastes", 2);
    const theirs = lands(game, "Forest", 2, B);
    activate(game, helix, 0, { x: 2, targets: theirs.map(ref) });
    expect(theirs.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Somnophore", () => {
  it("holds the damaged player's creature tapped while it stays on the battlefield", () => {
    const { game, a, b } = table();
    const somno = spawn(game, "Somnophore");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    b.declareBlockersFn = () => [];
    attack(game, a, [somno]);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game); // bob's turn: his untap step passes it by
    expect(game.state.objects[bears].tapped).toBe(true);
    destroy(game, somno);
    nextTurn(game);
    nextTurn(game); // bob's next untap step: free now
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Hidden Guerrillas", () => {
  it("becomes a 5/3 Soldier with trample, no longer an enchantment, when an opponent casts an artifact", () => {
    const { game } = table();
    const hg = spawn(game, "Hidden Guerrillas");
    nextTurn(game); // bob's turn
    lands(game, "Wastes", 1, B);
    const relic = toHand(game, "Ornithopter", B);
    cast(game, relic, { player: B });
    expect(types(game, hg)).toEqual(["creature"]);
    expect(pt(game, hg)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, hg).has("trample")).toBe(true);
  });
});

describe("Redeem", () => {
  it("prevents all damage to its targets this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Redeem"), { targets: [ref(bears), null] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Torch Song", () => {
  it("deals damage equal to its verse counters after being sacrificed", () => {
    const { game } = table();
    const song = spawn(game, "Torch Song");
    game.state.objects[song].counters.verse = 2;
    lands(game, "Mountain", 3);
    activate(game, song, 0, { targets: [ref(B)] });
    expect(zone(game, song)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Retromancer", () => {
  it("deals 3 damage to the targeting spell's controller, even its own controller", () => {
    const { game } = table();
    const retro = spawn(game, "Retromancer");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(retro)], settle: false });
    settle(game);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
  });
});
