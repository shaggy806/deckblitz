/**
 * Time Spiral (TSP; B228), group D. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Molder", () => {
  it("destroys an artifact of mana value X and gains X life", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Molder"), { x: 1, targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, A)).toBe(21);
  });
});

describe("Tromp the Domains", () => {
  it("gives creatures you control trample and +1/+1 per basic land type", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Tromp the Domains"));
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Divine Congregation", () => {
  it("gains 2 life for each creature the target player controls", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Divine Congregation"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(26);
  });
});

describe("Cavalry Master", () => {
  it("gives another flanker a second instance of flanking", () => {
    const { game, a, b } = table();
    spawn(game, "Cavalry Master");
    const cavalry = spawn(game, "Benalish Cavalry");
    const blocker = spawn(game, "Colossal Dreadmaw", B);
    b.declareBlockersFn = () => [{ blocker, attacker: cavalry }];
    attack(game, a, [cavalry]);
    expect(pt(game, blocker)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Mana Skimmer", () => {
  it("taps a land of the player it damaged, which stays tapped through their untap step", () => {
    const { game, a } = table();
    const skimmer = spawn(game, "Mana Skimmer");
    const forest = spawn(game, "Forest", B);
    pickTargets(a, forest);
    attack(game, a, [skimmer]);
    expect(game.state.objects[forest].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Candles of Leng", () => {
  it("puts the revealed card into the graveyard when one there shares its name", () => {
    const { game } = table();
    const candles = spawn(game, "Candles of Leng");
    lands(game, "Wastes", 4);
    toGraveyard(game, "Grizzly Bears");
    const top = toLibrary(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, candles);
    expect(zone(game, top)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("draws a card otherwise", () => {
    const { game } = table();
    const candles = spawn(game, "Candles of Leng");
    lands(game, "Wastes", 4);
    toGraveyard(game, "Grizzly Bears");
    const top = toLibrary(game, "Hill Giant");
    const before = hand(game).length;
    activate(game, candles);
    expect(zone(game, top)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(1);
  });
});

describe("Tolarian Sentinel", () => {
  it("discards a card to return a permanent you control", () => {
    const { game } = table();
    const sentinel = spawn(game, "Tolarian Sentinel");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    const before = hand(game).length;
    activate(game, sentinel, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(1);
  });
});
