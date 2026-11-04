/**
 * Something a permanent's controller does as it's about to enter (rule 614.1c,
 * `AsEntersAction`): exile cards from a graveyard, linked to it (rule 607.2a), or
 * return a permanent, and it enters with what that came to. Asked on any entry.
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  lands,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  types,
  subtypes,
  zone,
} from "./harness.js";

describe("Rescuer Sphinx: you may return a permanent as it enters", () => {
  it("returned: it enters with the counter, and nothing could respond between", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const ring = spawn(game, "Sol Ring", A);
    const land = spawn(game, "Forest", A);
    const theirs = spawn(game, "Sol Ring", B);
    const seen = pickPermanents(a, ring);
    const sphinx = toHand(game, "Rescuer Sphinx");
    cast(game, sphinx);
    expect(seen.offered).toContain(ring);
    expect(seen.offered).not.toContain(land);
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, sphinx)).toBe("battlefield");
    expect(counters(game, sphinx)).toBe(1);
    expect(pt(game, sphinx)).toEqual({ power: 4, toughness: 3 });
  });

  it("declined: no counter, and with nothing to return nothing is asked", () => {
    const { game, a } = table();
    lands(game, "Island", 8);
    spawn(game, "Sol Ring", A);
    pickPermanents(a);
    const sphinx = toHand(game, "Rescuer Sphinx");
    cast(game, sphinx);
    expect(counters(game, sphinx)).toBe(0);
  });

  it("is what it returns before it is on the battlefield, on an entry that wasn't a cast", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const ring = spawn(game, "Sol Ring", A);
    const sphinx = toGraveyard(game, "Rescuer Sphinx", A);
    pickFromZone(a, sphinx);
    const seen = pickPermanents(a, ring);
    cast(game, toHand(game, "Exhume"));
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, sphinx)).toBe("battlefield");
    expect(counters(game, sphinx)).toBe(1);
  });

  it("a token returned still counts", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const token = spawn(game, "Goblin Token", A);
    pickPermanents(a, token);
    const sphinx = toHand(game, "Rescuer Sphinx");
    cast(game, sphinx);
    expect(game.state.objects[token]?.zone === "battlefield").toBe(false);
    expect(counters(game, sphinx)).toBe(1);
  });

  it("a commander sent to the command zone instead wasn't returned (rule 903.9b)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const commander = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    pickPermanents(a, commander);
    let asked = 0;
    a.commanderReplacementFn = () => {
      asked += 1;
      return true;
    };
    const sphinx = toHand(game, "Rescuer Sphinx");
    cast(game, sphinx);
    expect(asked).toBe(1);
    expect(zone(game, commander)).toBe("command");
    expect(zone(game, sphinx)).toBe("battlefield");
    expect(counters(game, sphinx)).toBe(0);
  });

  it("a commander kept for the hand was returned", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const commander = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    pickPermanents(a, commander);
    a.commanderReplacementFn = () => false;
    const sphinx = toHand(game, "Rescuer Sphinx");
    cast(game, sphinx);
    expect(zone(game, commander)).toBe("hand");
    expect(counters(game, sphinx)).toBe(1);
  });

  it("a Clone copying it is asked too, and enters with the counter", () => {
    const { game, a } = table();
    lands(game, "Island", 8);
    pickPermanents(a);
    const sphinx = toHand(game, "Rescuer Sphinx");
    cast(game, sphinx);
    const ring = spawn(game, "Sol Ring", A);
    a.chooseCopyFn = () => sphinx;
    pickPermanents(a, ring);
    const clone = toHand(game, "Clone");
    cast(game, clone);
    expect(zone(game, ring)).toBe("hand");
    expect(counters(game, clone)).toBe(1);
  });
});

describe("Living Lore: the exiled card sets its size", () => {
  it("exiles the only instant or sorcery with no question, linked to it", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const spell = toGraveyard(game, "Divination", A);
    toGraveyard(game, "Grizzly Bears", A);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    const lore = toHand(game, "Living Lore");
    cast(game, lore);
    expect(asked).toBe(0);
    expect(zone(game, spell)).toBe("exile");
    expect(game.state.objects[spell].exiledWith).toEqual({
      source: lore,
      zoneChangeCount: game.state.objects[lore].zoneChangeCount,
    });
    expect(pt(game, lore)).toEqual({ power: 3, toughness: 3 });
  });

  it("chooses among several, from your own graveyard alone", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const small = toGraveyard(game, "Opt", A);
    const big = toGraveyard(game, "Divination", A);
    const theirs = toGraveyard(game, "Time Warp", B);
    const seen = pickFromZone(a, big);
    const lore = toHand(game, "Living Lore");
    cast(game, lore);
    expect(seen.offered).toEqual(expect.arrayContaining([small, big]));
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, small)).toBe("graveyard");
    expect(pt(game, lore).power).toBe(3);
  });

  it("with nothing to exile it's a 0/0 and dies", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const lore = toHand(game, "Living Lore");
    cast(game, lore);
    expect(graveyard(game, A)).toContain(lore);
  });

  it("a card exiled from there isn't linked to a later stint", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const spell = toGraveyard(game, "Divination", A);
    const lore = toHand(game, "Living Lore");
    pickFromZone(a, spell);
    cast(game, lore);
    expect(pt(game, lore).power).toBe(3);
    // Back through the graveyard as a new object (rule 400.7): no link.
    game.debugMove(lore, "graveyard");
    settle(game);
    const read = computeCharacteristics(game.state, registryOf(game), lore);
    expect(read.power).toBe(0);
  });

  it("deals combat damage: sacrifice it to cast the exiled card, free", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const spell = toGraveyard(game, "Divination", A);
    const lore = toHand(game, "Living Lore");
    cast(game, lore);
    game.state.objects[lore].summoningSick = false;
    const inHand = hand(game, A).length;
    pickModes(a, 0);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: spell, targets: [], via: "effect", free: true });
    attack(game, a, [lore]);
    expect(zone(game, lore)).toBe("graveyard");
    expect(hand(game, A).length).toBe(inHand + 2);
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("declining keeps it, and the card stays exiled", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const spell = toGraveyard(game, "Divination", A);
    const lore = toHand(game, "Living Lore");
    cast(game, lore);
    game.state.objects[lore].summoningSick = false;
    pickModes(a);
    attack(game, a, [lore]);
    expect(zone(game, lore)).toBe("battlefield");
    expect(zone(game, spell)).toBe("exile");
  });
});

describe("Sutured Ghoul: the total of the exiled cards", () => {
  it("any number, its power and toughness each their total, one move", () => {
    const { game, a } = table();
    lands(game, "Swamp", 7);
    const giant = toGraveyard(game, "Hill Giant", A); // 3/3
    const bears = toGraveyard(game, "Grizzly Bears", A); // 2/2
    const wall = toGraveyard(game, "Wall of Omens", A); // 0/4
    const kept = toGraveyard(game, "Llanowar Elves", A);
    pickFromZone(a, giant, bears, wall);
    const ghoul = toHand(game, "Sutured Ghoul");
    cast(game, ghoul);
    expect(zone(game, kept)).toBe("graveyard");
    expect(pt(game, ghoul)).toEqual({ power: 5, toughness: 9 });
    expect(game.eventsOfType("cards-left-graveyard").map((e) => e.objects.length)).toEqual([3]);
  });

  it("choosing none leaves a 0/0, which dies", () => {
    const { game, a } = table();
    lands(game, "Swamp", 7);
    toGraveyard(game, "Hill Giant", A);
    pickFromZone(a);
    const ghoul = toHand(game, "Sutured Ghoul");
    cast(game, ghoul);
    expect(graveyard(game, A)).toContain(ghoul);
  });

  it("can't exile itself as it's reanimated", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const ghoul = toGraveyard(game, "Sutured Ghoul", A);
    const giant = toGraveyard(game, "Hill Giant", A);
    let answer = 0;
    let offered: readonly unknown[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      answer += 1;
      if (answer === 1) return [ghoul];
      offered = eligible;
      return [giant];
    };
    cast(game, toHand(game, "Exhume"));
    expect(offered).toEqual([giant]);
    expect(pt(game, ghoul)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Dermotaxi: imprinted from any graveyard", () => {
  it("chooses from a graveyard of anyone's, and becomes a copy until end of turn", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const giant = toGraveyard(game, "Hill Giant", B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const seen = pickFromZone(a, giant);
    const taxi = toHand(game, "Dermotaxi");
    cast(game, taxi);
    expect(seen.offered).toEqual(expect.arrayContaining([giant, mine]));
    expect(zone(game, giant)).toBe("exile");
    expect(types(game, taxi)).toEqual(["artifact"]);

    const crew = [spawn(game, "Grizzly Bears", A), spawn(game, "Grizzly Bears", A)];
    pickPermanents(a, ...crew);
    pickFromZone(a, giant);
    activate(game, taxi);
    expect(crew.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(pt(game, taxi)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, taxi)).toEqual(expect.arrayContaining(["creature", "artifact"]));
    expect(subtypes(game, taxi)).toEqual(expect.arrayContaining(["Giant", "Vehicle"]));
    expect(game.state.objects[taxi].cardName).toBeDefined();

    game.advanceUntil((s) => s.turn.number === 2);
    settle(game);
    expect(types(game, taxi)).toEqual(["artifact"]);
  });
});

describe("Mimeoplasm, Revered One", () => {
  it("up to X, three counters each, then a copy of one that keeps the ability and the counters", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Island", 9);
    const giant = toGraveyard(game, "Hill Giant", A);
    const serra = toGraveyard(game, "Serra Angel", A);
    const left = toGraveyard(game, "Grizzly Bears", A);
    pickFromZone(a, giant, serra);
    const ooze = toHand(game, "Mimeoplasm, Revered One");
    cast(game, ooze, { x: 2 });
    expect(zone(game, left)).toBe("graveyard");
    expect(counters(game, ooze)).toBe(6);
    expect(pt(game, ooze)).toEqual({ power: 6, toughness: 6 });

    activate(game, ooze, 0, { targets: [ref(serra)] });
    // It's a Serra Angel with flying and vigilance, base 0/0, the counters on.
    expect(pt(game, ooze)).toEqual({ power: 6, toughness: 6 });
    expect(game.characteristics(ooze).keywords.has("flying")).toBe(true);
    // And can still become the other (it kept this ability).
    activate(game, ooze, 0, { targets: [ref(giant)] });
    expect(game.characteristics(ooze).keywords.has("flying")).toBe(false);
    expect(controller(game, ooze)).toBe(A);
  });

  it("X of 0 asks nothing, and it dies a 0/0", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    toGraveyard(game, "Hill Giant", A);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    const ooze = toHand(game, "Mimeoplasm, Revered One");
    cast(game, ooze, { x: 0 });
    expect(asked).toBe(0);
    expect(graveyard(game, A)).toContain(ooze);
  });
});

describe("Frankenstein's Monster", () => {
  it("exiles X and picks a counter for each", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const one = toGraveyard(game, "Hill Giant", A);
    const two = toGraveyard(game, "Grizzly Bears", A);
    const kept = toGraveyard(game, "Llanowar Elves", A);
    pickFromZone(a, one, two);
    const picks = ["+2/+0", "+0/+2"];
    a.chooseCreatureTypeFn = () => picks.shift() as string;
    const monster = toHand(game, "Frankenstein's Monster");
    cast(game, monster, { x: 2 });
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, kept)).toBe("graveyard");
    expect(counters(game, monster, "+2/+0")).toBe(1);
    expect(counters(game, monster, "+0/+2")).toBe(1);
    expect(pt(game, monster)).toEqual({ power: 2, toughness: 3 });
  });

  it("can't exile X: it goes to the graveyard, and nothing is exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const one = toGraveyard(game, "Hill Giant", A);
    const monster = toHand(game, "Frankenstein's Monster");
    cast(game, monster, { x: 2 });
    expect(zone(game, monster)).toBe("graveyard");
    expect(zone(game, one)).toBe("graveyard");
  });

  it("X of 0 enters a 0/1", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const monster = toHand(game, "Frankenstein's Monster");
    cast(game, monster, { x: 0 });
    expect(zone(game, monster)).toBe("battlefield");
    expect(pt(game, monster)).toEqual({ power: 0, toughness: 1 });
  });
});
