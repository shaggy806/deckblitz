/**
 * The set walk, Doctor Who (WHO), group a (2026-10-17): mostly Sagas. Written
 * on the shared table in `harness.ts`, each from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("The Flux", () => {
  it("VI adds six {R}, and the Saga is sacrificed after it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = spawn(game, "The Flux");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    game.state.objects[saga].counters.lore = 5;
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R").length).toBe(6);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("II exiles the top card of your library, playable this turn", () => {
    const { game, a } = table();
    pickTargets(a, null);
    const saga = spawn(game, "The Flux");
    settle(game);
    const top = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes"); // drawn in the draw step
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.objects[saga].counters.lore).toBe(2);
    expect(zone(game, top)).toBe("exile");
    lands(game, "Forest", 2);
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
  });
});

describe("The Night of the Doctor", () => {
  it("I destroys all creatures; II returns a legendary creature card with your choice of counter", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const saga = spawn(game, "The Night of the Doctor");
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");

    const jane = toGraveyard(game, "Doctor Jane Foster");
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      offered = legal[0] ?? [];
      return [{ kind: "object", object: jane }];
    };
    pickModes(a, 2);
    toStep(game, "precombat-main");
    settle(game);
    // A nonlegendary creature card isn't a legal target.
    expect(JSON.stringify(offered)).not.toContain(`"${mine}"`);
    expect(zone(game, jane)).toBe("battlefield");
    expect(counters(game, jane, "lifelink")).toBe(1);
    expect(counters(game, jane, "first-strike")).toBe(0);
    expect(keywords(game, jane).has("lifelink")).toBe(true);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Heaven Sent", () => {
  it("III draws seven when the damage leaves an opponent at 0 life", () => {
    const { game } = table();
    const saga = spawn(game, "Heaven Sent");
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    game.state.players[B].life = 1;
    game.state.objects[saga].counters.lore = 2;
    toStep(game, "precombat-main");
    const before = hand(game).length;
    settle(game);
    expect(hand(game).length).toBe(before + 7);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("III otherwise exiles the Saga, and you may cast it this turn", () => {
    const { game } = table();
    const saga = spawn(game, "Heaven Sent");
    settle(game);
    game.state.objects[saga].counters.lore = 2;
    toStep(game, "precombat-main");
    const before = hand(game).length;
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before);
    expect(zone(game, saga)).toBe("exile");
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const clues = tokensNamed(game, "Clue Token", A);
    cast(game, saga, { via: "impulse" });
    // Cast again, it's a new Saga: chapter I investigates.
    const [again] = named(game, "Heaven Sent", A);
    expect(zone(game, again)).toBe("battlefield");
    expect(tokensNamed(game, "Clue Token", A)).toBe(clues + 1);
  });
});

describe("Gallifrey Stands", () => {
  it("returns every Doctor card from your graveyard, and wins at thirteen Doctors", () => {
    const { game, a } = table();
    const healers = [toGraveyard(game, "Cult Healer"), toGraveyard(game, "Cult Healer")];
    const bears = toGraveyard(game, "Grizzly Bears");
    enter(game, "Gallifrey Stands");
    for (const h of healers) expect(zone(game, h)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");

    for (let i = 0; i < 12; i++) spawn(game, "Cult Healer");
    const seen = pickFromZone(a, healers[0]);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toContain(healers[1]);
    expect(zone(game, healers[0])).toBe("battlefield");
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("doesn't win with twelve Doctors after declining the put", () => {
    const { game, a } = table();
    spawn(game, "Gallifrey Stands");
    for (let i = 0; i < 12; i++) spawn(game, "Cult Healer");
    toHand(game, "Cult Healer");
    pickFromZone(a);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.result.over).toBe(false);
  });
});

describe("Traverse Eternity", () => {
  it("draws the greatest mana value among historic permanents only", () => {
    const { game } = table();
    spawn(game, "Doctor Jane Foster"); // legendary, mana value 4
    spawn(game, "Sol Ring"); // artifact, mana value 1
    spawn(game, "Colossal Dreadmaw"); // mana value 6, not historic
    lands(game, "Island", 4);
    const spell = toHand(game, "Traverse Eternity");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 4);
  });
});

describe("Time Lord Regeneration", () => {
  it("when the Time Lord dies, reveals until a Time Lord creature card and puts it onto the battlefield", () => {
    const { game } = table();
    const doctor = spawn(game, "The Thirteenth Doctor");
    const next = toLibrary(game, "The Thirteenth Doctor");
    const bears = toLibrary(game, "Grizzly Bears");
    const wastes = toLibrary(game, "Wastes");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Time Lord Regeneration"), { targets: [ref(doctor)] });
    destroy(game, doctor);
    settle(game);
    expect(zone(game, doctor)).toBe("graveyard");
    expect(zone(game, next)).toBe("battlefield");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2)).toEqual(expect.arrayContaining([bears, wastes]));
  });
});
