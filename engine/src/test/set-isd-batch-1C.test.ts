/**
 * Innistrad and Dark Ascension (ISD, DKA) — group C: Auras, Equipment,
 * combat triggers and a few plain spells.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  grant,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Spiteful Shadows", () => {
  it("the enchanted creature deals the damage to its controller, so its lifelink applies", () => {
    for (const lifelink of [false, true]) {
      const { game, a } = table();
      const bears = spawn(game, "Grizzly Bears", B);
      if (lifelink) grant(game, bears, "lifelink");
      lands(game, "Swamp", 2);
      pickTargets(a, bears);
      cast(game, toHand(game, "Spiteful Shadows"), { targets: [ref(bears)] });
      lands(game, "Mountain", 1);
      cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
      expect(zone(game, bears)).toBe("graveyard");
      expect(life(game, B)).toBe(lifelink ? 20 : 18);
      expect(life(game, A)).toBe(20);
    }
  });
});

describe("Soul Seizer", () => {
  it("transforms on combat damage and steals the targeted creature", () => {
    const { game, a } = table();
    const seizer = spawn(game, "Soul Seizer");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [seizer]);
    expect(life(game, B)).toBe(19);
    expect(zone(game, seizer)).toBe("battlefield");
    expect(game.state.objects[seizer].attachedTo).toBe(bears);
    expect(controller(game, bears)).toBe(A);
  });

  it("declining leaves it a creature", () => {
    const { game, a } = table();
    const seizer = spawn(game, "Soul Seizer");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [seizer]);
    expect(game.state.objects[seizer].attachedTo).toBeNull();
    expect(pt(game, seizer)).toEqual({ power: 1, toughness: 3 });
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Kessig Cagebreakers", () => {
  it("makes an attacking Wolf per creature card in your graveyard", () => {
    const { game, a } = table();
    const cage = spawn(game, "Kessig Cagebreakers");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Grizzly Bears", B);
    attack(game, a, [cage]);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(3);
    expect(life(game, B)).toBe(20 - 3 - 6);
  });
});

describe("Creepy Doll", () => {
  it("flips a coin for each creature it damages in combat, destroying it on a win", () => {
    const outcomes = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const { game, a, b } = table({ seed });
      const doll = spawn(game, "Creepy Doll");
      const bears = spawn(game, "Grizzly Bears", B);
      b.declareBlockersFn = () => [{ blocker: bears, attacker: doll }];
      attack(game, a, [doll]);
      expect(zone(game, doll)).toBe("battlefield");
      outcomes.add(zone(game, bears));
    }
    expect(outcomes).toEqual(new Set(["battlefield", "graveyard"]));
  });
});

describe("Bonds of Faith", () => {
  it("pumps a Human; a non-Human can't attack", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const human = spawn(game, "Gavony Ironwright");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, human);
    cast(game, toHand(game, "Bonds of Faith"), { targets: [ref(human)] });
    expect(pt(game, human)).toEqual({ power: 3, toughness: 6 });
    pickTargets(a, bears);
    cast(game, toHand(game, "Bonds of Faith"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(whyCannotAttack(game.state, registryOf(game), A, bears, B)).not.toBeNull();
    expect(whyCannotAttack(game.state, registryOf(game), A, human, B)).toBeNull();
  });
});

describe("Angelic Overseer", () => {
  it("has hexproof and indestructible only while you control a Human", () => {
    const { game } = table();
    const angel = spawn(game, "Angelic Overseer");
    expect(keywords(game, angel).has("indestructible")).toBe(false);
    spawn(game, "Gavony Ironwright", B);
    expect(keywords(game, angel).has("hexproof")).toBe(false);
    spawn(game, "Gavony Ironwright");
    expect(keywords(game, angel).has("hexproof")).toBe(true);
    expect(keywords(game, angel).has("indestructible")).toBe(true);
  });
});

describe("Gavony Ironwright", () => {
  it("gives other creatures +1/+4 at 5 or less life", () => {
    const { game } = table();
    const wright = spawn(game, "Gavony Ironwright");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.state.players[A].life = 5;
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 6 });
    expect(pt(game, wright)).toEqual({ power: 1, toughness: 4 });
  });
});

describe("Wolfhunter's Quiver", () => {
  it("the equipped creature pings any target, or deals 3 only to a Werewolf", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const quiver = spawn(game, "Wolfhunter's Quiver");
    game.state.objects[quiver].attachedTo = bears;
    const giant = spawn(game, "Hill Giant", B);
    const hermit = spawn(game, "Hinterland Hermit", B);
    expect(() => activate(game, bears, 1, { targets: [ref(giant)] })).toThrow(/refused/);
    activate(game, bears, 1, { targets: [ref(hermit)] });
    expect(zone(game, hermit)).toBe("graveyard");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Traitorous Blood", () => {
  it("steals, untaps and gives trample and haste until end of turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Traitorous Blood"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("trample")).toBe(true);
    expect(keywords(game, giant).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, giant)).toBe(B);
  });
});

describe("Chill of Foreboding", () => {
  it("each player mills five", () => {
    const { game } = table();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Chill of Foreboding"));
    expect(graveyard(game, A)).toHaveLength(6);
    expect(graveyard(game, B)).toHaveLength(5);
  });
});
