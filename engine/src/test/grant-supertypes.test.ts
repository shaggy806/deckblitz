/**
 * A static that adds a supertype, in layer 4 (rule 613.1d —
 * `StaticAbility.addSupertypes`, read through `effectiveSupertypes`), and
 * Lifecraft Engine's chosen creature type, which needed no code. Each test
 * written from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics, effectiveSubtypes, effectiveSupertypes } from "../characteristics.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, keywords, lands, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type G = Parameters<typeof lands>[0];

function mana(game: G, n = 2): void {
  for (const basic of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, basic, n);
}

const supertypes = (game: G, id: ObjectId): readonly string[] =>
  effectiveSupertypes(game.state, game.registry, game.state.objects[id]);
const subtypes = (game: G, id: ObjectId): readonly string[] =>
  effectiveSubtypes(game.state, game.registry, game.state.objects[id]);
const power = (game: G, id: ObjectId): number => computeCharacteristics(game.state, game.registry, id).power;
const matches = (game: G, id: ObjectId, filter: Parameters<typeof matchesFilter>[3]): boolean =>
  matchesFilter(game.state, game.registry, id, filter, { you: A });

describe("On Serra's Wings", () => {
  it("makes the creature legendary, +1/+1 with its keywords, and the view says so", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    mana(game);
    cast(game, toHand(game, "On Serra's Wings"), { targets: [ref(bears)] });
    expect(supertypes(game, bears)).toContain("legendary");
    expect(matches(game, bears, { supertype: "legendary" })).toBe(true);
    expect(matches(game, bears, { notSupertype: "legendary" })).toBe(false);
    expect(power(game, bears)).toBe(3);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(game.viewFor(B).objects[bears].supertypes).toContain("legendary");
  });

  it("the legend rule leaves a same-named creature that isn't legendary alone (the ruling)", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    mana(game);
    cast(game, toHand(game, "On Serra's Wings"), { targets: [ref(one)] });
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("battlefield");
  });

  it("the legend rule reads it on a printed legend's namesake, a copy of the same name", () => {
    const { game } = table();
    const printed = spawn(game, "Krenko, Mob Boss");
    const twin = spawn(game, "Krenko, Mob Boss");
    game.state.objects[twin].modifiers.push({ power: 0, toughness: 0, keywords: [], removeSupertypes: ["legendary"], untilEndOfTurn: false, copiable: true, timestamp: -1 });
    mana(game);
    cast(game, toHand(game, "On Serra's Wings"), { targets: [ref(twin)] });
    // Two legendary permanents of one name now: one goes to the graveyard.
    expect([printed, twin].filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
  });

  it("isn't legendary any more once the Aura has gone", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    mana(game);
    const wings = toHand(game, "On Serra's Wings");
    cast(game, wings, { targets: [ref(bears)] });
    game.debugMove(wings, "graveyard");
    settle(game);
    expect(supertypes(game, bears)).not.toContain("legendary");
  });

  it("as it dies, it's remembered as legendary (rule 608.2h)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    mana(game);
    cast(game, toHand(game, "On Serra's Wings"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[bears].lastKnown?.supertypes).toContain("legendary");
  });
});

describe("In Bolas's Clutches", () => {
  it("takes any permanent and makes it legendary, leaving its owner's same-named one alone (the ruling)", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const mine = spawn(game, "Sol Ring");
    mana(game);
    cast(game, toHand(game, "In Bolas's Clutches"), { targets: [ref(ring)] });
    expect(game.state.objects[ring].controller).toBe(A);
    expect(supertypes(game, ring)).toContain("legendary");
    expect(supertypes(game, mine)).not.toContain("legendary");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Leyline of Singularity", () => {
  it("makes every nonland permanent legendary, and the legend rule follows at once (rule 704.5j)", () => {
    const { game } = table();
    const land = spawn(game, "Forest");
    const yours = spawn(game, "Grizzly Bears", B);
    const first = spawn(game, "Sol Ring");
    const second = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Sol Ring", B);
    mana(game);
    const leyline = toHand(game, "Leyline of Singularity");
    cast(game, leyline);
    expect(supertypes(game, land)).not.toContain("legendary");
    expect(supertypes(game, leyline)).toContain("legendary");
    expect(supertypes(game, yours)).toContain("legendary");
    // The state-based action, each player's own: Bob's one Sol Ring is safe,
    // and Alice's scripted seat keeps one of hers.
    expect(zone(game, theirs)).toBe("battlefield");
    expect([first, second].filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
  });

  it("an animated land stays a land, and out of its reach", () => {
    const { game } = table();
    const land = spawn(game, "Forest");
    spawn(game, "Leyline of Singularity");
    game.debugApplyEffect(
      A,
      { kind: "become", target: 0, power: 2, toughness: 2, addTypes: ["creature"], keywords: [], duration: "end-of-turn" },
      [ref(land)],
    );
    expect(supertypes(game, land)).not.toContain("legendary");
  });

  it("a static asking for legendary sees what it added", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    expect(matches(game, bears, { supertype: "legendary" })).toBe(false);
    spawn(game, "Leyline of Singularity");
    expect(matches(game, bears, { supertype: "legendary" })).toBe(true);
  });
});

describe("Glittering Frost", () => {
  it("makes the land snow, its mana snow mana, and adds a mana of any color", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Glittering Frost"), { targets: [ref(forest)] });
    expect(supertypes(game, forest)).toEqual(expect.arrayContaining(["basic", "snow"]));
    expect(subtypes(game, forest)).toContain("Forest");
    // {1}{S} is payable off the snow land (rule 107.4h), whichever lands the
    // cast tapped: untap them all, and the Owl's cost asks for one snow mana.
    for (const id of game.state.zones.shared.battlefield) {
      game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(id)]);
    }
    settle(game);
    const owl = spawn(game, "Rimefeather Owl");
    const target = spawn(game, "Grizzly Bears", B);
    activate(game, owl, 0, { targets: [ref(target)] });
    expect(game.state.objects[target].counters.ice).toBe(1);
  });

  it("no snow source, no {S}", () => {
    const { game } = table();
    const owl = spawn(game, "Rimefeather Owl");
    const target = spawn(game, "Grizzly Bears", B);
    mana(game);
    expect(() => activate(game, owl, 0, { targets: [ref(target)] })).toThrow();
  });
});

describe("Rimefeather Owl", () => {
  it("is as big as the snow permanents on the battlefield, and an ice counter makes one", () => {
    const { game } = table();
    const owl = spawn(game, "Rimefeather Owl");
    expect(power(game, owl)).toBe(1);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "ice", amount: 1 }, [ref(bears)]);
    expect(supertypes(game, bears)).toContain("snow");
    expect(power(game, owl)).toBe(2);
    expect(computeCharacteristics(game.state, game.registry, owl).toughness).toBe(2);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "ice", amount: 1 }, [ref(bears)]);
    expect(supertypes(game, bears)).not.toContain("snow");
    expect(power(game, owl)).toBe(1);
  });
});

describe("Rootpath Purifier", () => {
  it("makes lands you control basic, and no others, and gives them no land type (the ruling)", () => {
    const { game } = table();
    const mine = spawn(game, "Rogue's Passage");
    const theirs = spawn(game, "Rogue's Passage", B);
    spawn(game, "Rootpath Purifier");
    expect(supertypes(game, mine)).toContain("basic");
    expect(supertypes(game, theirs)).not.toContain("basic");
    expect(subtypes(game, mine)).toEqual([]);
  });

  it("makes land cards in your library basic, not another's, and not elsewhere", () => {
    const { game } = table();
    const mine = toLibrary(game, "Rogue's Passage");
    const theirs = toLibrary(game, "Rogue's Passage", B);
    const inHand = toHand(game, "Rogue's Passage");
    const creature = toLibrary(game, "Grizzly Bears");
    spawn(game, "Rootpath Purifier");
    expect(matches(game, mine, { supertype: "basic", type: "land" })).toBe(true);
    expect(matches(game, theirs, { supertype: "basic", type: "land" })).toBe(false);
    expect(matches(game, inHand, { supertype: "basic", type: "land" })).toBe(false);
    expect(matches(game, creature, { supertype: "basic" })).toBe(false);
  });

  // The Purifier's ruling: Blood Moon can no longer apply to the lands you
  // control because they're all basic, whichever came first (rule 613.8a).
  for (const order of ["Blood Moon first", "Purifier first"] as const) {
    it(`takes your lands out of Blood Moon's reach: ${order}`, () => {
      const { game } = table();
      if (order === "Purifier first") spawn(game, "Rootpath Purifier");
      spawn(game, "Blood Moon", B);
      if (order === "Blood Moon first") spawn(game, "Rootpath Purifier");
      const mine = spawn(game, "Rogue's Passage");
      const theirs = spawn(game, "Rogue's Passage", B);
      expect(subtypes(game, mine)).not.toContain("Mountain");
      expect(subtypes(game, theirs)).toContain("Mountain");
    });
  }

  it("a land of yours keeps its text under Blood Moon: Urborg still makes every land a Swamp", () => {
    const { game } = table();
    spawn(game, "Blood Moon", B);
    spawn(game, "Rootpath Purifier");
    spawn(game, "Urborg, Tomb of Yawgmoth");
    const forest = spawn(game, "Forest", B);
    expect(subtypes(game, forest)).toContain("Swamp");
  });

  it("without the Purifier, Blood Moon still takes Urborg's text", () => {
    const { game } = table();
    spawn(game, "Blood Moon", B);
    spawn(game, "Urborg, Tomb of Yawgmoth");
    const forest = spawn(game, "Forest", B);
    expect(subtypes(game, forest)).not.toContain("Swamp");
  });
});

describe("Lifecraft Engine", () => {
  function engineNamed(game: G, type: string): ObjectId {
    const engine = spawn(game, "Lifecraft Engine");
    game.state.objects[engine].chosenCreatureType = type;
    return engine;
  }

  it("gives each other creature of the chosen type +1/+1, not itself", () => {
    const { game } = table();
    const engine = engineNamed(game, "Bear");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Serra Angel");
    expect(power(game, bears)).toBe(3);
    expect(power(game, theirs)).toBe(2);
    expect(power(game, other)).toBe(4);
    expect(subtypes(game, engine)).not.toContain("Bear");
  });

  it("a crewed Vehicle is the chosen type, and other crewed Vehicles get the bonus; uncrewed they aren't", () => {
    const { game } = table();
    const engine = engineNamed(game, "Bear");
    const copter = spawn(game, "Smuggler's Copter");
    expect(subtypes(game, copter)).not.toContain("Bear");
    const angel = spawn(game, "Serra Angel");
    const bears = spawn(game, "Grizzly Bears");
    const crew = (vehicle: ObjectId, tap: ObjectId): void => {
      game.dispatch({ type: "activate-ability", player: A, source: vehicle, abilityIndex: 0, targets: [], tap: [tap] });
      settle(game);
    };
    crew(copter, bears);
    crew(engine, angel);
    expect(subtypes(game, copter)).toEqual(expect.arrayContaining(["Vehicle", "Bear"]));
    expect(subtypes(game, engine)).toEqual(expect.arrayContaining(["Vehicle", "Bear"]));
    // The Copter's a Bear, so +1/+1; the Engine doesn't pump itself.
    expect(power(game, copter)).toBe(4);
    expect(power(game, engine)).toBe(4);
  });
});
