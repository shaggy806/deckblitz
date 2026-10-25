/**
 * Alliances, group C: Exile's attacking-creature target and life gain,
 * Swamp Mosquito's poison, the discard-or-sacrifice drawbacks (Balduvian
 * Horde, Lim-Dûl's Paladin), Gift of the Woods' aura trigger, Phyrexian Boon's
 * colour check, Floodwater Dam's doubled X, Soldevi Heretic's opponent draw
 * and Wandering Mage's -1/-1 counter cost.
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
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  enter,
  zone,
} from "./harness.js";

describe("Exile", () => {
  it("exiles a nonwhite attacking creature and gains life equal to its toughness", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 3);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "declare-blockers");
    pickTargets(a, giant);
    cast(game, toHand(game, "Exile"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(23);
  });

  it("can't target a creature that isn't attacking", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 3);
    expect(() => cast(game, toHand(game, "Exile"), { targets: [ref(giant)] })).toThrow();
  });
});

describe("Swamp Mosquito", () => {
  it("gives the defending player a poison counter when unblocked", () => {
    const { game, a } = table();
    const mosquito = spawn(game, "Swamp Mosquito");
    attack(game, a, [mosquito]);
    expect(game.state.players[B].counters.poison).toBe(1);
  });
});

describe("Balduvian Horde", () => {
  it("is sacrificed if you don't discard", () => {
    const { game, a } = table();
    pickModes(a);
    const horde = enter(game, "Balduvian Horde");
    expect(zone(game, horde)).toBe("graveyard");
  });

  it("stays if you discard a card at random", () => {
    const { game, a } = table();
    const before = hand(game).length;
    pickModes(a, 0);
    const horde = enter(game, "Balduvian Horde");
    expect(zone(game, horde)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });

  it("is sacrificed with an empty hand", () => {
    const { game, a } = table();
    game.state.zones.perPlayer[A].hand.length = 0;
    pickModes(a, 0);
    const horde = enter(game, "Balduvian Horde");
    expect(zone(game, horde)).toBe("graveyard");
  });
});

describe("Lim-Dûl's Paladin", () => {
  it("is sacrificed and draws a card if you don't discard in your upkeep", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Lim-Dûl's Paladin");
    pickModes(a);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(zone(game, paladin)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("stays if you discard", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Lim-Dûl's Paladin");
    pickModes(a, 0);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(zone(game, paladin)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });

  it("unblocked, deals no combat damage and the defending player loses 4 life", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Lim-Dûl's Paladin");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [ref(paladin)]);
    attack(game, a, [paladin]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Gift of the Woods", () => {
  it("gives +0/+3 and 1 life when the enchanted creature becomes blocked", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const gift = spawn(game, "Gift of the Woods");
    game.state.objects[gift].attachedTo = bears;
    const blocker = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears).toughness).toBe(5);
    expect(life(game, A)).toBe(21);
  });
});

describe("Phyrexian Boon", () => {
  it("gives a black creature +2/+1 and any other -1/-2", () => {
    const { game } = table();
    const mosquito = spawn(game, "Swamp Mosquito");
    const giant = spawn(game, "Hill Giant");
    const boon1 = spawn(game, "Phyrexian Boon");
    const boon2 = spawn(game, "Phyrexian Boon");
    game.state.objects[boon1].attachedTo = mosquito;
    game.state.objects[boon2].attachedTo = giant;
    expect(pt(game, mosquito)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Floodwater Dam", () => {
  it("pays {X}{X}{1} to tap X target lands", () => {
    const { game } = table();
    const dam = spawn(game, "Floodwater Dam");
    const mine = lands(game, "Wastes", 5);
    const theirs = lands(game, "Forest", 2, B);
    activate(game, dam, 0, { x: 2, targets: [ref(theirs[0]), ref(theirs[1])] });
    expect(theirs.every((l) => game.state.objects[l].tapped)).toBe(true);
    expect(mine.every((l) => game.state.objects[l].tapped)).toBe(true);
  });
});

describe("Soldevi Heretic", () => {
  it("lets the target opponent draw a card", () => {
    const { game, b } = table();
    const heretic = spawn(game, "Soldevi Heretic");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    const before = hand(game, B).length;
    pickModes(b, 0);
    activate(game, heretic, 0, { targets: [ref(bears), ref(B)] });
    expect(hand(game, B).length).toBe(before + 1);
  });
});

describe("Wandering Mage", () => {
  it("puts a -1/-1 counter on a creature you control to protect a player", () => {
    const { game, a } = table();
    const mage = spawn(game, "Wandering Mage");
    lands(game, "Swamp", 1);
    pickPermanents(a, mage);
    activate(game, mage, 2, { targets: [ref(A)] });
    expect(counters(game, mage, "-1/-1")).toBe(1);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    expect(life(game, A)).toBe(19);
  });
});
