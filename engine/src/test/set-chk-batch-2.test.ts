import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  enter,
  hand,
  lands,
  life,
  named,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

// Batch 212, the rest of Champions of Kamigawa: the lead's cards. The Zubera
// count is `{ turnHistory: "died", who: "each-player", filter: { subtype:
// "Zubera" } }` — every Zubera that died this turn, whoever controlled it,
// the dying one included.

describe("the Zubera", () => {
  it("count every Zubera that died this turn, an opponent's included, and nothing else", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const dream = spawn(game, "Floating-Dream Zubera");
    const chant = spawn(game, "Silent-Chant Zubera");
    const theirs = spawn(game, "Ember-Fist Zubera", B);
    const bears = spawn(game, "Grizzly Bears", B);
    // Ember-Fist's trigger is B's; it aims at A.
    pickTargets(a, A);
    const handBefore = hand(game, A).length;
    const lifeBefore = life(game, A);
    cast(game, toHand(game, "Hideous Laughter"));
    settle(game);
    for (const id of [dream, chant, theirs, bears]) expect(zone(game, id)).toBe("graveyard");
    // Three Zubera died (the Bears don't count): draw 3, gain 2 × 3, and
    // B's Ember-Fist deals 3 to A.
    expect(hand(game, A).length).toBe(handBefore + 3);
    expect(life(game, A)).toBe(lifeBefore + 6 - 3);
  });

  it("count the dying Zubera itself when it dies alone", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Dripping-Tongue Zubera");
    cast(game, toHand(game, "Hideous Laughter"));
    settle(game);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(1);
  });

  it("Ashen-Skin makes the target opponent discard a card per Zubera", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Ashen-Skin Zubera");
    spawn(game, "Floating-Dream Zubera");
    pickTargets(a, B);
    const theirHand = hand(game, B).length;
    cast(game, toHand(game, "Hideous Laughter"));
    settle(game);
    expect(hand(game, B).length).toBe(theirHand - 2);
  });
});

// `tap` and `exile` take `"trigger-recipient"` as `destroy` does: what a
// `deals-damage` trigger's damage was dealt to, untargeted.
describe("that creature, of a deals-damage trigger", () => {
  it("Kashi-Tribe Warriors taps the creature it dealt combat damage to, and it stays tapped", () => {
    const { game, a, b } = table();
    const warriors = spawn(game, "Kashi-Tribe Warriors");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: warriors }];
    attack(game, a, [warriors]);
    expect(game.state.objects[wall]!.tapped).toBe(true);
    expect(game.state.objects[wall]!.skipsNextUntap).toBe(true);
  });

  it("Pit Spawn exiles the creature it deals damage to", () => {
    const { game, a, b } = table();
    const spawnId = spawn(game, "Pit Spawn");
    // Indestructible, so it's still there when the trigger resolves.
    const wall = spawn(game, "Darksteel Myr", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: spawnId }];
    attack(game, a, [spawnId]);
    expect(zone(game, wall)).toBe("exile");
  });

  it("Kaldra Compleat's Germ exiles an indestructible blocker", () => {
    const { game, a, b } = table();
    enter(game, "Kaldra Compleat");
    const [germ] = named(game, "Phyrexian Germ Token");
    expect(pt(game, germ!)).toEqual({ power: 5, toughness: 5 });
    game.state.objects[germ!]!.summoningSick = false;
    const wall = spawn(game, "Darksteel Myr", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: germ! }];
    attack(game, a, [germ!]);
    expect(zone(game, wall)).toBe("exile");
  });
});
