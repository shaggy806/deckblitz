import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("CN2 batch 1 (a)", () => {
  it("Lieutenants of the Guard: a counter per strength vote, a Soldier per numbers vote", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const lt = enter(game, "Lieutenants of the Guard");
    expect(counters(game, lt)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("Messenger Jays: draws per quill vote, then discards that many", () => {
    const { game, a, b } = table();
    pickModes(a, 1);
    pickModes(b, 1);
    const before = hand(game).length;
    const gyBefore = graveyard(game).length;
    const jays = enter(game, "Messenger Jays");
    expect(counters(game, jays)).toBe(0);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(gyBefore + 2);
  });

  it("Ballot Broker gives its controller an extra vote", () => {
    const { game, a, b } = table();
    spawn(game, "Ballot Broker");
    pickModes(a, 0);
    pickModes(b, 1);
    const lt = enter(game, "Lieutenants of the Guard");
    expect(counters(game, lt)).toBe(2);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("Borderland Explorer: only a player who discarded may search", () => {
    const { game, a, b } = table();
    const forest = toLibrary(game, "Forest", A);
    toLibrary(game, "Forest", B);
    // Alice discards and searches; bob declines to discard.
    let aliceAsked = 0;
    a.chooseModesFn = () => {
      aliceAsked += 1;
      return [0];
    };
    pickModes(b);
    pickFromZone(a, forest);
    const handBefore = hand(game).length;
    const bobBefore = hand(game, B).length;
    enter(game, "Borderland Explorer");
    expect(aliceAsked).toBe(2);
    expect(hand(game)).toContain(forest);
    expect(hand(game).length).toBe(handBefore); // -1 discarded, +1 Forest
    expect(hand(game, B).length).toBe(bobBefore);
  });

  it("Custodi Soulcaller returns a creature card with mana value up to the players attacked", () => {
    const { game, a, b, c } = table({ players: 3 });
    const soul = spawn(game, "Custodi Soulcaller");
    const bear = spawn(game, "Grizzly Bears");
    const two = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, two);
    pickModes(b);
    pickModes(c);
    a.declareAttackersFn = () => [
      { attacker: soul, defender: B },
      { attacker: bear, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(zone(game, two)).toBe("battlefield");
  });

  it("Fang of the Pack grants another creature melee until end of turn", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "Fang of the Pack");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    attack(game, a, [bear]);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
  });

  it("Grenzo's Ruffians: combat damage to one opponent is dealt to each other opponent", () => {
    const { game, a } = table({ players: 3 });
    const ruff = spawn(game, "Grenzo's Ruffians");
    attack(game, a, [ruff]);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
  });

  it("Besmirch steals, untaps and goads a creature", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Besmirch"), { targets: [{ kind: "object", object: bear }] });
    expect(controller(game, bear)).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(false);
  });

  it("Kaya's 0 with a target: the controller chooses which to exile; it returns at their next upkeep", () => {
    const { game, a } = table();
    const kaya = spawn(game, "Kaya, Ghost Assassin");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    loyalty(game, kaya, 0, { targets: [{ kind: "object", object: bear }] });
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, kaya)).toBe("battlefield");
    expect(life(game)).toBe(18);
    toStep(game, "draw");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });

  it("Kaya's 0 with no target exiles Kaya", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya, Ghost Assassin");
    loyalty(game, kaya, 0, { targets: [null] });
    expect(zone(game, kaya)).toBe("exile");
    expect(life(game)).toBe(18);
  });
});
