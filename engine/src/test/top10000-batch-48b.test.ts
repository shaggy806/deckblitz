/**
 * Card batch 48, part b (2026-10-11): ranks 6773–6797. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Ishkanah, Grafwidow", () => {
  it("makes three Spiders only with delirium", () => {
    const graveyardOf = (cards: readonly string[]): number => {
      const { game } = table();
      for (const card of cards) toGraveyard(game, card);
      enter(game, "Ishkanah, Grafwidow");
      return tokensNamed(game, "1/2 Green Spider Token (Reach)", A);
    };
    // Land, creature, artifact: three card types.
    expect(graveyardOf(["Forest", "Grizzly Bears", "Sol Ring"])).toBe(0);
    // …and an instant: four.
    expect(graveyardOf(["Forest", "Grizzly Bears", "Sol Ring", "Lightning Bolt"])).toBe(3);
  });

  it("drains the target opponent 1 for each Spider you control, itself included", () => {
    const { game } = table();
    const ishkanah = spawn(game, "Ishkanah, Grafwidow");
    spawn(game, "1/2 Green Spider Token (Reach)");
    spawn(game, "1/2 Green Spider Token (Reach)", B);
    lands(game, "Swamp", 7);
    activate(game, ishkanah, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Boromir, Gondor's Hope", () => {
  it("offers a Human or an artifact card from the top six as it enters, and bottoms the rest", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    const inspector = toLibrary(game, "Thraben Inspector");
    const seen = pickFromZone(a, inspector);
    enter(game, "Boromir, Gondor's Hope");
    expect(seen.offered).toContain(inspector);
    expect(seen.offered).toContain(ring);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, inspector)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    // The other five went to the bottom: the top is a Wastes from the deck.
    expect(library.slice(-5)).toEqual(expect.arrayContaining([bears, ring]));
  });
});

describe("Magnetic Theft", () => {
  it("attaches an opponent's Equipment to your creature without taking control of it", () => {
    const { game } = table();
    const splitter = spawn(game, "Bonesplitter", B);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Mountain");
    cast(game, toHand(game, "Magnetic Theft"), { targets: [ref(splitter), ref(bears)] });
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    expect(controller(game, splitter)).toBe(B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Mausoleum Wanderer", () => {
  it("asks for {X} equal to its power as it was sacrificed, pumps included", () => {
    const { game, a } = table();
    const wanderer = spawn(game, "Mausoleum Wanderer");
    enter(game, "Mausoleum Wanderer");
    expect(pt(game, wanderer)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Mountain");
    spawn(game, "Island");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    const bolt = game.state.zones.shared.stack[0];
    // She'd pay if she could — one Island can't pay {2}.
    a.chooseModesFn = () => [0];
    activate(game, wanderer, 0, { targets: [ref(bolt)] });
    expect(zone(game, wanderer)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Tome of the Guildpact", () => {
  it("draws for a multicolored spell, not a monocolored one", () => {
    const { game } = table();
    spawn(game, "Tome of the Guildpact");
    lands(game, "Mountain", 2);
    spawn(game, "Plains");
    const before = hand(game).length;
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Keleth, Sunmane Familiar", () => {
  it("puts a counter on an attacking commander you control, not on another attacker", () => {
    const { game, a } = table();
    spawn(game, "Keleth, Sunmane Familiar");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].isCommander = true;
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [giant, bears]);
    expect(counters(game, giant)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Nissa, Vastwood Seer // Nissa, Sage Animist", () => {
  it("transforms as a land enters only once you control seven lands", () => {
    const { game } = table();
    const nissa = spawn(game, "Nissa, Vastwood Seer");
    lands(game, "Forest", 5);
    enter(game, "Forest");
    expect(game.state.objects[nissa].face ?? 0).toBe(0);
    enter(game, "Forest");
    expect(game.state.objects[nissa].face).toBe(1);
    expect(counters(game, nissa, "loyalty")).toBe(3);
  });

  it("−7 untaps the target lands and makes them 6/6 Elemental creature lands for good", () => {
    const { game } = table();
    const nissa = spawn(game, "Nissa, Vastwood Seer");
    const forests = lands(game, "Forest", 6);
    enter(game, "Forest");
    expect(game.state.objects[nissa].face).toBe(1);
    // A loyalty ability waits for a main phase with an empty stack.
    toStep(game, "postcombat-main");
    game.state.objects[nissa].counters.loyalty = 7;
    const [first, second] = forests;
    game.state.objects[first].tapped = true;
    activate(game, nissa, 2, { targets: [ref(first), ref(second)] });
    expect(game.state.objects[first].tapped).toBe(false);
    expect(pt(game, first)).toEqual({ power: 6, toughness: 6 });
    expect(types(game, second)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, second)).toEqual(expect.arrayContaining(["Forest", "Elemental"]));
    expect(types(game, forests[2])).not.toContain("creature");
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, first)).toEqual({ power: 6, toughness: 6 });
  });
});
