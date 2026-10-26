/**
 * Portal and Portal Second Age, group E: the "before attackers are declared"
 * activations, the "sacrifice it unless" rider, the untap skip and the
 * counting abilities.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  enter,
  zone,
} from "./harness.js";

const tapAction = (source: ObjectId, targets: readonly ObjectId[] = []): Action => ({
  type: "activate-ability",
  player: A,
  source,
  abilityIndex: 0,
  targets: targets.map(ref),
});

/** Alice holds priority in bob's precombat main. */
function alicePriorityOnBobsTurn(game: Game): void {
  game.advanceUntil(
    (s) => activePlayerOf(s) === B && s.turn.step === "precombat-main" && s.priority.holder === A,
  );
}

describe("Stern Marshal (before attackers are declared)", () => {
  it("activates in alice's precombat main, not in her second main or on bob's turn", () => {
    const { game } = table();
    const marshal = spawn(game, "Stern Marshal");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, marshal, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });

    game.state.objects[marshal].tapped = false;
    toStep(game, "postcombat-main");
    expect(game.canDispatch(tapAction(marshal, [bears]))).not.toBeNull();

    alicePriorityOnBobsTurn(game);
    expect(game.state.objects[marshal].tapped).toBe(false);
    expect(game.canDispatch(tapAction(marshal, [bears]))).not.toBeNull();
  });
});

describe("Talas Researcher", () => {
  it("draws a card in the precombat main, but not in the second main", () => {
    const { game } = table();
    const researcher = spawn(game, "Talas Researcher");
    const before = hand(game).length;
    activate(game, researcher);
    expect(hand(game).length).toBe(before + 1);
    game.state.objects[researcher].tapped = false;
    toStep(game, "postcombat-main");
    expect(game.canDispatch(tapAction(researcher))).not.toBeNull();
  });
});

describe("Steam Catapult", () => {
  it("destroys a tapped creature, and can't target an untapped one", () => {
    const { game } = table();
    const catapult = spawn(game, "Steam Catapult");
    const untapped = spawn(game, "Grizzly Bears", B);
    expect(game.canDispatch(tapAction(catapult, [untapped]))).not.toBeNull();
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    activate(game, catapult, 0, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
  });
});

describe("Primeval Force", () => {
  it("is sacrificed with two Forests; three Forests keep it", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const first = enter(game, "Primeval Force");
    expect(zone(game, first)).toBe("graveyard");
    const forests = [...lands(game, "Forest", 1), ...game.battlefield.filter((id) => game.state.objects[id].cardName === "Forest")];
    const three = [...new Set(forests)];
    expect(three.length).toBe(3);
    pickModes(a, 0);
    pickPermanents(a, ...three);
    const second = enter(game, "Primeval Force");
    expect(zone(game, second)).toBe("battlefield");
    for (const id of three) expect(zone(game, id)).toBe("graveyard");
  });
});

describe("Exhaustion", () => {
  it("keeps bob's creatures and lands tapped through his next untap step, one that arrives later too", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const land = spawn(game, "Forest", B, { tapped: true });
    const rock = spawn(game, "Mind Stone", B, { tapped: true });
    cast(game, toHand(game, "Exhaustion"), { targets: [ref(B)] });
    const later = spawn(game, "Hill Giant", B, { tapped: true });
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(true);
    expect(game.state.objects[later].tapped).toBe(true);
    expect(game.state.objects[rock].tapped).toBe(false);
  });
});

describe("Fruition", () => {
  it("counts every Forest on the battlefield, not only alice's", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Forest", 3, B);
    cast(game, toHand(game, "Fruition"));
    expect(life(game, A)).toBe(25);
  });
});

describe("Cruel Bargain", () => {
  it("draws four and loses half the life, rounded up", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    game.state.players[A].life = 15;
    const spell = toHand(game, "Cruel Bargain");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 4);
    expect(life(game, A)).toBe(7);
  });
});

describe("Swarm of Rats and Nightstalker Engine", () => {
  it("Swarm's power counts the Rats alice controls, itself included", () => {
    const { game } = table();
    const swarm = spawn(game, "Swarm of Rats");
    expect(pt(game, swarm)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Swarm of Rats");
    spawn(game, "Swarm of Rats", B);
    expect(pt(game, swarm)).toEqual({ power: 2, toughness: 1 });
  });

  it("Engine's power counts creature cards in alice's graveyard only", () => {
    const { game } = table();
    const engine = spawn(game, "Nightstalker Engine");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears", B);
    expect(graveyard(game).length).toBeGreaterThanOrEqual(3);
    expect(pt(game, engine)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Devastation", () => {
  it("destroys creatures and lands, not other permanents", () => {
    const { game } = table();
    const own = lands(game, "Mountain", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const rock = spawn(game, "Mind Stone", B);
    cast(game, toHand(game, "Devastation"));
    expect(zone(game, bears)).toBe("graveyard");
    for (const id of own) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, rock)).toBe("battlefield");
  });
});
