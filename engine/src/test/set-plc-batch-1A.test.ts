/**
 * Planar Chaos (PLC; B200), group A. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Life and Limb", () => {
  it("makes Forests 1/1 green Saproling creatures and Saprolings Forest lands, on every side", () => {
    const { game } = table();
    spawn(game, "Life and Limb");
    const forest = spawn(game, "Forest", B);
    const saproling = spawn(game, "Saproling Token");
    for (const id of [forest, saproling]) {
      expect(types(game, id)).toEqual(expect.arrayContaining(["creature", "land"]));
      expect(subtypes(game, id)).toEqual(expect.arrayContaining(["Saproling", "Forest"]));
      expect(pt(game, id)).toEqual({ power: 1, toughness: 1 });
      expect([...game.characteristics(id).colors]).toEqual(["G"]);
    }
    const wastes = spawn(game, "Wastes");
    expect(types(game, wastes)).toEqual(["land"]);
  });
});

describe("Mirri the Cursed", () => {
  it("gets a +1/+1 counter when it deals combat damage to a blocker", () => {
    const { game, a, b } = table();
    const mirri = spawn(game, "Mirri the Cursed");
    const spider = spawn(game, "Giant Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: mirri }];
    attack(game, a, [mirri]);
    // First strike: 3 to the 2/4, the counter, then 2 back to a 4/3 Mirri.
    expect(counters(game, mirri)).toBe(1);
    expect(zone(game, mirri)).toBe("battlefield");
    expect(zone(game, spider)).toBe("battlefield");
  });

  it("gets none for damage to a player", () => {
    const { game, a } = table();
    const mirri = spawn(game, "Mirri the Cursed");
    attack(game, a, [mirri]);
    expect(life(game, B)).toBe(17);
    expect(counters(game, mirri)).toBe(0);
  });
});

describe("Darkheart Sliver and Spitting Sliver", () => {
  it("reach every player's Slivers; the sacrificed Sliver's controller gains the life", () => {
    const { game } = table();
    spawn(game, "Darkheart Sliver");
    const spitting = spawn(game, "Spitting Sliver", B);
    const mine = spawn(game, "Spitting Sliver");
    expect(keywords(game, spitting).has("first-strike")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    activate(game, mine, 0);
    expect(zone(game, mine)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });
});

describe("Stormfront Riders", () => {
  it("returns two creatures you control, making a Soldier for each", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    const riders = game.debugSpawn("Stormfront Riders", A, "hand");
    pickPermanents(a, bears, riders);
    lands(game, "Plains", 5);
    cast(game, riders);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, riders)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("triggers for a creature you own returned from an opponent's control, not for theirs", () => {
    const { game } = table();
    const riders = spawn(game, "Stormfront Riders");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [{ kind: "object", object: theirs }]);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [{ kind: "object", object: mine }]);
    settle(game);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [{ kind: "object", object: mine }]);
    settle(game);
    expect(zone(game, mine)).toBe("hand");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    expect(zone(game, riders)).toBe("battlefield");
  });
});

describe("Vorosh, the Hunter", () => {
  it("may pay {2}{G} on combat damage to a player for six +1/+1 counters", () => {
    const { game, a } = table();
    const vorosh = spawn(game, "Vorosh, the Hunter");
    lands(game, "Forest", 3);
    pickModes(a, 0);
    attack(game, a, [vorosh]);
    expect(life(game, B)).toBe(14);
    expect(counters(game, vorosh)).toBe(6);
  });
});

describe("Blightspeaker", () => {
  it("finds a Rebel permanent card with mana value 3 or less onto the battlefield", () => {
    const { game, a } = table();
    const speaker = spawn(game, "Blightspeaker");
    lands(game, "Wastes", 4);
    toLibrary(game, "Grizzly Bears");
    const rebel = toLibrary(game, "Fresh Volunteers");
    pickFromZone(a, rebel);
    activate(game, speaker, 1);
    expect(zone(game, rebel)).toBe("battlefield");
  });
});

describe("Shaper Parasite", () => {
  it("turned face up, gives the target the mode chosen as it resolves", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    lands(game, "Island", 3);
    const parasite = toHand(game, "Shaper Parasite");
    cast(game, parasite, { via: "face-down" });
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 1);
    game.dispatch({ type: "turn-face-up", player: A, permanent: parasite, morph: true });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 4 });
  });
});

describe("Vitaspore Thallid", () => {
  it("sacrifices a Saproling to give a creature haste", () => {
    const { game } = table();
    const thallid = spawn(game, "Vitaspore Thallid");
    const saproling = spawn(game, "Saproling Token");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: thallid,
      abilityIndex: 1,
      targets: [{ kind: "object", object: bears }],
      sacrifice: saproling,
    });
    settle(game);
    expect(named(game, "Saproling Token", A)).toHaveLength(0);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});
