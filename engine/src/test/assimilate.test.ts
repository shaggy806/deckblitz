// Assimilate (Star Trek): "put it onto the battlefield under your control with
// a +1/+1 counter. It's a Borg artifact creature and loses all other creature
// types" — `EnterTypes.setSubtypes` beside `addTypes` (rule 205.1b's
// "[creature type] artifact creature": every other type and subtype kept,
// its creature types replaced), spread from `ASSIMILATE`.
import { describe, expect, it } from "vitest";
import { ASSIMILATE } from "../cards/helpers.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("assimilate — the enter-as types", () => {
  it("keeps an artifact subtype and other card types, replaces the creature types", () => {
    const { game } = table();
    const sash = toGraveyard(game, "Lion Sash", B);
    const ram = toGraveyard(game, "Nyx-Fleece Ram", B);
    for (const card of [sash, ram]) {
      game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, underYourControl: true, ...ASSIMILATE }, [ref(card)]);
      settle(game);
    }
    expect(zone(game, sash)).toBe("battlefield");
    expect(controller(game, sash)).toBe(A);
    expect(subtypes(game, sash)).toEqual(expect.arrayContaining(["Equipment", "Borg"]));
    expect(subtypes(game, sash)).not.toContain("Cat");
    expect(counters(game, sash)).toBe(1);
    expect(types(game, ram)).toEqual(expect.arrayContaining(["enchantment", "artifact", "creature"]));
    expect(subtypes(game, ram)).toEqual(["Borg"]);
  });
});

describe("assimilate — the cards", () => {
  it("Borg Queen, Perfection Manifest assimilates a creature card from an opponent's graveyard", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Borg Queen, Perfection Manifest");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(types(game, bears)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, bears)).toEqual(["Borg"]);
    // 2/2, a +1/+1 counter, the Queen's +2/+0 for artifact creatures.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
  });

  it("Borg Queen, Perfection Manifest can't take a card from your own graveyard", () => {
    const { game, a } = table();
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const seen = watchTargets(a);
    enter(game, "Borg Queen, Perfection Manifest");
    expect(seen.offered[0] ?? []).not.toContain(mine);
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("The Borg Queen: the opponent exiles until a creature card, it's assimilated, the rest go to the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    const plains = toLibrary(game, "Plains", B);
    pickTargets(a, B);
    enter(game, "The Borg Queen");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(subtypes(game, bears)).toEqual(["Borg"]);
    expect(counters(game, bears)).toBe(1);
    // 2/2 + counter + the Queen's +2/+2.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const library = game.state.zones.perPlayer[B].library;
    expect(zone(game, plains)).toBe("library");
    expect(library.indexOf(plains)).toBe(library.length - 1);
  });

  it("Assimilation Assessor exiles a graveyard and assimilates a creature card from it as it attacks", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const plains = toGraveyard(game, "Plains", B);
    pickTargets(a, B);
    const assessor = enter(game, "Assimilation Assessor");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, plains)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(0);
    pickFromZone(a, bears);
    attack(game, a, [assessor]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(subtypes(game, bears)).toEqual(["Borg"]);
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, plains)).toBe("exile");
  });

  it("Assimilation Assessor takes only cards exiled with it", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const assessor = enter(game, "Assimilation Assessor");
    const other = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(other)]);
    settle(game);
    expect(zone(game, other)).toBe("exile");
    attack(game, a, [assessor]);
    expect(zone(game, other)).toBe("exile");
  });

  it("Assimilate the Wounded takes, from each opponent, a creature card that died this turn", () => {
    const { game, players } = table({ players: 3 });
    expect(players).toHaveLength(3);
    const bobs = enter(game, "Grizzly Bears", B);
    const carols = toGraveyard(game, "Grizzly Bears", C);
    destroy(game, bobs);
    const died = graveyard(game, B)[0];
    expect(died).toBeDefined();
    const spell = toHand(game, "Assimilate the Wounded");
    lands(game, "Swamp", 3);
    // Carol's was never on the battlefield this turn: not a legal target.
    expect(() => cast(game, spell, { targets: [ref(died), ref(carols), null] })).toThrow(/target/i);
    if (died === undefined) return;
    cast(game, spell, { targets: [ref(died), null, null] });
    expect(zone(game, died)).toBe("battlefield");
    expect(controller(game, died)).toBe(A);
    expect(subtypes(game, died)).toEqual(["Borg"]);
    expect(counters(game, died)).toBe(1);
    expect(zone(game, carols)).toBe("graveyard");
  });

  it("Death Is Irrelevant assimilates at your end step, and your artifact creatures are indestructible", () => {
    const { game, a } = table();
    enter(game, "Death Is Irrelevant");
    const ram = toGraveyard(game, "Nyx-Fleece Ram", A);
    pickTargets(a, ram);
    toStep(game, "end");
    settle(game);
    expect(zone(game, ram)).toBe("battlefield");
    expect(types(game, ram)).toEqual(expect.arrayContaining(["enchantment", "artifact", "creature"]));
    expect(subtypes(game, ram)).toEqual(["Borg"]);
    expect(keywords(game, ram).has("indestructible")).toBe(true);
  });
});
