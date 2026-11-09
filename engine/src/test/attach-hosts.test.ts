/**
 * Where an Aura or Equipment goes, beyond a target or the source:
 *
 * - put onto the battlefield attached to a permanent **chosen as it enters**
 *   (`attachedTo: { among }` — One Last Job, Nomad Mythmaker): an Aura's
 *   choice of what it enchants (rule 303.4f) limited to the filter, none and
 *   it stays (303.4g); an Equipment's host among those it could equip, none
 *   and it enters unattached (301.5e);
 * - put onto the battlefield attached to a **player** in a target slot
 *   (Bitterheart Witch's Curse — rule 303.4), from a search or a hand
 *   (`search-library`'s and `look-and-choose`'s `attachedTo` — Arachnus
 *   Spinner, Academy Researchers);
 * - `attach` onto the card this resolution put onto the battlefield
 *   (`"put-this-way"` — Pre-War Formalwear), or onto a permanent chosen as
 *   it resolves among those it can legally go on (`{ among }` — Stonehewer
 *   Giant, Aura Graft);
 * - "This Equipment can be attached only to …" (`attachOnlyTo` — O-Naginata,
 *   Gate Smasher, rule 301.5c).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  lands,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { ScriptedController } from "../controller.js";

/** The seat answers what an entering Aura enchants with `pick`, recording the
 * options it was offered. */
function pickEnchant(seat: ScriptedController, pick: (options: readonly ObjectId[]) => ObjectId | PlayerId) {
  const seen = { options: [] as readonly ObjectId[], players: [] as readonly PlayerId[], asked: 0 };
  seat.chooseEnchantFn = (_view, _source, options, players) => {
    seen.asked += 1;
    seen.options = options;
    seen.players = players;
    return pick(options);
  };
  return seen;
}

describe("One Last Job: attached to a creature you control, chosen as it enters", () => {
  it("an Aura enchants the creature of yours chosen — only yours are offered (rule 303.4f)", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const rancor = toGraveyard(game, "Rancor");
    const seen = pickEnchant(a, () => giant);
    cast(game, toHand(game, "One Last Job"), { modes: [2], targets: [ref(rancor)] });
    expect(seen.asked).toBe(1);
    expect([...seen.options].sort()).toEqual([bears, giant].sort());
    expect(seen.players).toEqual([]);
    expect(zone(game, rancor)).toBe("battlefield");
    expect(game.state.objects[rancor].attachedTo).toBe(giant);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 3 });
  });

  it("an Aura with no creature of yours to enchant stays in the graveyard (rule 303.4g)", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Grizzly Bears", B);
    const rancor = toGraveyard(game, "Rancor");
    cast(game, toHand(game, "One Last Job"), { modes: [2], targets: [ref(rancor)] });
    expect(zone(game, rancor)).toBe("graveyard");
  });

  it("an Equipment enters attached to the creature of yours chosen, among those it can equip", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const mace = toGraveyard(game, "+2 Mace");
    const seen = pickPermanents(a, bears);
    cast(game, toHand(game, "One Last Job"), { modes: [2], targets: [ref(mace)] });
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(zone(game, mace)).toBe("battlefield");
    expect(game.state.objects[mace].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("an Equipment with no creature of yours enters unattached (rule 301.5e)", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Grizzly Bears", B);
    const mace = toGraveyard(game, "+2 Mace");
    cast(game, toHand(game, "One Last Job"), { modes: [2], targets: [ref(mace)] });
    expect(zone(game, mace)).toBe("battlefield");
    expect(game.state.objects[mace].attachedTo).toBeNull();
  });

  it("Gate Smasher is offered only the creatures it can be attached to", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    const smasher = toGraveyard(game, "Gate Smasher");
    const seen = pickPermanents(a, bears);
    cast(game, toHand(game, "One Last Job"), { modes: [2], targets: [ref(smasher)] });
    // Only one creature qualifies, so nothing is asked.
    expect(seen.offered).toEqual([]);
    expect(game.state.objects[smasher].attachedTo).toBe(angel);
  });
});

describe("Nomad Mythmaker", () => {
  it("puts an opponent's Aura card onto the battlefield under your control on a creature you control", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const myth = spawn(game, "Nomad Mythmaker");
    const theirs = spawn(game, "Grizzly Bears", B);
    const pacifism = toGraveyard(game, "Pacifism", B);
    const seen = pickEnchant(a, (options) => options[0]);
    activate(game, myth, 0, { targets: [ref(pacifism)] });
    expect(seen.options).toEqual([myth]);
    expect(seen.options).not.toContain(theirs);
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(game.state.objects[pacifism].controller).toBe(A);
    expect(game.state.objects[pacifism].attachedTo).toBe(myth);
  });
});

describe("attached to a player, from a search", () => {
  it("Bitterheart Witch's Curse enchants the target player", () => {
    const { game, a } = table();
    const witch = spawn(game, "Bitterheart Witch");
    const curse = toLibrary(game, "Curse of Opulence");
    pickTargets(a, B);
    pickModes(a, 0);
    pickFromZone(a, curse);
    destroy(game, witch);
    expect(zone(game, witch)).toBe("graveyard");
    expect(zone(game, curse)).toBe("battlefield");
    expect(game.state.objects[curse].attachedToPlayer).toBe(B);
  });
});

describe("Arachnus Spinner", () => {
  it("finds Arachnus Web in the graveyard and puts it onto the target creature", () => {
    const { game, a } = table();
    const spinner = spawn(game, "Arachnus Spinner");
    const flyer = spawn(game, "Serra Angel", B);
    const web = toGraveyard(game, "Arachnus Web");
    pickModes(a, 2);
    pickFromZone(a, web);
    activate(game, spinner, 0, { targets: [ref(flyer)] });
    expect(zone(game, web)).toBe("battlefield");
    expect(game.state.objects[web].attachedTo).toBe(flyer);
    expect(game.state.objects[spinner].tapped).toBe(true);
  });
});

describe("Academy Researchers", () => {
  it("puts an Aura card from hand onto the battlefield attached to itself", () => {
    const { game, a } = table();
    const rancor = toHand(game, "Rancor");
    pickFromZone(a, rancor);
    const researchers = enter(game, "Academy Researchers");
    expect(zone(game, rancor)).toBe("battlefield");
    expect(game.state.objects[rancor].attachedTo).toBe(researchers);
    expect(pt(game, researchers)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("attach onto what was put onto the battlefield this way", () => {
  it("Pre-War Formalwear returns a creature card and attaches itself to it", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    const formalwear = enter(game, "Pre-War Formalwear");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[formalwear].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("attaches to nothing with no creature card to return", () => {
    const { game } = table();
    const formalwear = enter(game, "Pre-War Formalwear");
    expect(game.state.objects[formalwear].attachedTo).toBeNull();
  });
});

describe("attach onto a permanent chosen as it resolves", () => {
  it("Stonehewer Giant finds an Equipment and attaches it to the creature of yours chosen", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const giant = spawn(game, "Stonehewer Giant");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const mace = toLibrary(game, "+2 Mace");
    pickFromZone(a, mace);
    const seen = pickPermanents(a, bears);
    activate(game, giant, 0);
    expect([...seen.offered].sort()).toEqual([giant, bears].sort());
    expect(zone(game, mace)).toBe("battlefield");
    expect(game.state.objects[mace].attachedTo).toBe(bears);
  });

  it("Stonehewer Giant can't attach O-Naginata to a creature with power less than 3", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const giant = spawn(game, "Stonehewer Giant");
    const bears = spawn(game, "Grizzly Bears");
    const naginata = toLibrary(game, "O-Naginata");
    pickFromZone(a, naginata);
    const seen = pickPermanents(a, giant);
    activate(game, giant, 0);
    expect(seen.offered).toEqual([giant]);
    expect(seen.offered).not.toContain(bears);
    expect(game.state.objects[naginata].attachedTo).toBe(giant);
  });

  it("Aura Graft takes an Aura and moves it to another permanent it can enchant", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Serra Angel", B);
    const rancor = spawn(game, "Rancor", B);
    game.state.objects[rancor].attachedTo = theirs;
    const seen = pickPermanents(a, mine);
    cast(game, toHand(game, "Aura Graft"), { targets: [ref(rancor)] });
    expect([...seen.offered].sort()).toEqual([mine, other].sort());
    expect(game.state.objects[rancor].controller).toBe(A);
    expect(game.state.objects[rancor].attachedTo).toBe(mine);
  });
});

describe("attached only to a creature that qualifies (rule 301.5c)", () => {
  it("O-Naginata's equip on a small creature resolves without moving it", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const naginata = spawn(game, "O-Naginata");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    activate(game, naginata, 0, { targets: [ref(bears)] });
    expect(game.state.objects[naginata].attachedTo).toBeNull();
    activate(game, naginata, 0, { targets: [ref(giant)] });
    expect(game.state.objects[naginata].attachedTo).toBe(giant);
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 3 });
  });

  it("Gate Smasher falls off a creature whose toughness drops below 4 (rule 704.5n)", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const smasher = spawn(game, "Gate Smasher");
    const angel = spawn(game, "Serra Angel");
    activate(game, smasher, 0, { targets: [ref(angel)] });
    expect(game.state.objects[smasher].attachedTo).toBe(angel);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 0, toughness: -2, duration: "end-of-turn" }, [ref(angel)]);
    // The state-based check runs before the next priority.
    toStep(game, "begin-combat");
    expect(game.state.objects[smasher].attachedTo).toBeNull();
  });
});
