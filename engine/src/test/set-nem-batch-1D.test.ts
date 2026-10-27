/**
 * Nemesis (NEM) batch 1, group D: fading (Parallax Wave, Ancient Hydra), the
 * Laccolith becomes-blocked damage (Laccolith Grunt, Laccolith Rig), Angelic
 * Favor's tap-a-creature alternative cost, Accumulated Knowledge, Coiling
 * Woodworm and Arc Mage.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  enter,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Parallax Wave", () => {
  it("enters with five fade counters, exiles for one, and returns what it exiled when it leaves", () => {
    const { game } = table();
    const wave = enter(game, "Parallax Wave");
    expect(counters(game, wave, "fade")).toBe(5);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, wave, 0, { targets: [ref(bears)] });
    expect(counters(game, wave, "fade")).toBe(4);
    expect(zone(game, bears)).toBe("exile");
    destroy(game, wave);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Grizzly Bears" && game.state.objects[id].controller === B)).toBe(true);
  });

  it("removes a fade counter each upkeep, and is sacrificed when it can't", () => {
    const { game } = table();
    const wave = enter(game, "Parallax Wave");
    game.state.objects[wave].counters.fade = 1;
    toStep(game, "draw");
    expect(zone(game, wave)).toBe("battlefield");
    expect(counters(game, wave, "fade")).toBe(0);
    toStep(game, "draw");
    expect(zone(game, wave)).toBe("graveyard");
  });
});

describe("Ancient Hydra", () => {
  it("removes a fade counter and pays {1} to ping any target", () => {
    const { game } = table();
    const hydra = enter(game, "Ancient Hydra");
    expect(counters(game, hydra, "fade")).toBe(5);
    spawn(game, "Mountain");
    activate(game, hydra, 0, { targets: [ref(B)] });
    expect(counters(game, hydra, "fade")).toBe(4);
    expect(life(game, B)).toBe(19);
  });
});

describe("Laccolith Grunt", () => {
  it("when blocked, may deal its power to target creature and then assigns no combat damage", () => {
    const { game, a, b } = table();
    const grunt = spawn(game, "Laccolith Grunt");
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: grunt }];
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [grunt]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(0);
  });
});

describe("Laccolith Rig", () => {
  it("has the enchanted creature deal its power when it becomes blocked, then assign no combat damage", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const rig = spawn(game, "Laccolith Rig");
    game.state.objects[rig].attachedTo = giant;
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: giant }];
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [giant]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(0);
  });
});

describe("Angelic Favor", () => {
  it("can't be cast outside combat", () => {
    const { game } = table();
    spawn(game, "Plains");
    const bears = spawn(game, "Grizzly Bears");
    const favor = toHand(game, "Angelic Favor");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: favor, targets: [], altCost: true, tap: [bears] }),
    ).not.toBeNull();
  });

  it("taps a creature instead of its mana cost during combat, and the Angel is exiled at the end step", () => {
    const { game } = table();
    spawn(game, "Plains");
    const bears = spawn(game, "Grizzly Bears");
    const favor = toHand(game, "Angelic Favor");
    toStep(game, "begin-combat");
    game.dispatch({ type: "cast-spell", player: A, card: favor, targets: [], altCost: true, tap: [bears] });
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(1);
    toStep(game, "cleanup");
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(0);
  });

  it("isn't offered for free without a Plains", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const favor = toHand(game, "Angelic Favor");
    toStep(game, "begin-combat");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: favor, targets: [], altCost: true, tap: [bears] }),
    ).not.toBeNull();
  });
});

describe("Accumulated Knowledge", () => {
  it("draws one plus one per Accumulated Knowledge in all graveyards", () => {
    const { game } = table();
    spawn(game, "Island");
    spawn(game, "Island");
    toGraveyard(game, "Accumulated Knowledge", A);
    toGraveyard(game, "Accumulated Knowledge", B);
    const ak = toHand(game, "Accumulated Knowledge");
    const before = hand(game).length;
    // casting it takes it out of hand: -1, then 1 + 2 drawn
    cast(game, ak);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Coiling Woodworm", () => {
  it("has power equal to the Forests on the battlefield", () => {
    const { game } = table();
    const worm = spawn(game, "Coiling Woodworm");
    spawn(game, "Forest");
    spawn(game, "Forest", B);
    expect(pt(game, worm)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Arc Mage", () => {
  it("discards a card to split 2 damage between two targets", () => {
    const { game } = table();
    const mage = spawn(game, "Arc Mage");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: mage,
      abilityIndex: 0,
      targets: [ref(bears), ref(B)],
      division: [1, 1],
    });
    settle(game);
    expect(hand(game).length).toBe(before - 1);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});
