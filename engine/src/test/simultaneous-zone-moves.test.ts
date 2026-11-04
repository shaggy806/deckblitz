/**
 * One instruction moving several objects is one event: each player's choice of
 * a card (Exhume, Crypt Champion, Tempting Wurm — `choicesHeld`, rule 101.4),
 * a creature exiled and a land found (Sword of Hearth and Home — a search's
 * `alongExiledThisWay`), several modes' targets (Call Damage Control —
 * `castModal.simultaneous`).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Exhume: each player's card enters at once", () => {
  it("nothing enters until the last has chosen, in turn order from the active player", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const giant = toGraveyard(game, "Hill Giant", A);
    const elf = toGraveyard(game, "Llanowar Elves", B);
    toGraveyard(game, "Opt", B);
    const seen: string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      seen.push(`alice:${eligible.length}`);
      return [bears];
    };
    b.chooseFromZoneFn = (_view, eligible) => {
      // Alice has chosen, and what she chose is still in her graveyard.
      seen.push(`bob:${eligible.length}:${zone(game, bears)}`);
      return [elf];
    };
    cast(game, toHand(game, "Exhume"));
    expect(seen).toEqual(["alice:2", "bob:1:graveyard"]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, elf)).toBe("battlefield");
    expect(controller(game, elf)).toBe(B);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("each sees the other enter, whichever moved first", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    // Bob's moves after Alice's, and still sees hers enter (rule 603.6a).
    const warden = toGraveyard(game, "Soul Warden", B);
    pickFromZone(a, bears);
    pickFromZone(b, warden);
    const before = life(game, B);
    cast(game, toHand(game, "Exhume"));
    expect(zone(game, warden)).toBe("battlefield");
    expect(life(game, B)).toBe(before + 1);
  });

  it("a player with no creature card chooses nothing, and the rest still enter", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    pickFromZone(a, bears);
    cast(game, toHand(game, "Exhume"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.heldChoices).toBeUndefined();
  });

  it("an entering card's as-enters choice is made before any of them moves", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const clone = toGraveyard(game, "Clone", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const elf = toGraveyard(game, "Llanowar Elves", B);
    pickFromZone(a, clone);
    pickFromZone(b, elf);
    let elfWas: string | undefined;
    a.chooseCopyFn = () => {
      elfWas = zone(game, elf);
      return bears;
    };
    cast(game, toHand(game, "Exhume"));
    expect(elfWas).toBe("graveyard");
    expect(zone(game, clone)).toBe("battlefield");
    expect(zone(game, elf)).toBe("battlefield");
  });

  it("four players choose in turn, and each one's card enters under its owner", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    lands(game, "Swamp", 2);
    const cards = [
      toGraveyard(game, "Grizzly Bears", A),
      toGraveyard(game, "Hill Giant", B),
      toGraveyard(game, "Llanowar Elves", C),
      toGraveyard(game, "Serra Angel", D),
    ];
    const order: string[] = [];
    for (const [i, seat] of [a, b, c, d].entries()) {
      seat.chooseFromZoneFn = () => {
        order.push(`${i}:${cards.filter((id) => zone(game, id) === "battlefield").length}`);
        return [cards[i]];
      };
    }
    cast(game, toHand(game, "Exhume"));
    expect(order).toEqual(["0:0", "1:0", "2:0", "3:0"]);
    expect(cards.map((id) => zone(game, id))).toEqual(Array(4).fill("battlefield"));
    expect(cards.map((id) => controller(game, id))).toEqual([A, B, C, D]);
  });
});

describe("the graveyard departure of a held entry is one move", () => {
  it("Tormod, reading only its own graveyard, fires once", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Tormod, the Desecrator", A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const elf = toGraveyard(game, "Llanowar Elves", B);
    pickFromZone(a, bears);
    pickFromZone(b, elf);
    cast(game, toHand(game, "Exhume"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("what leaves two graveyards together is announced as one", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const elf = toGraveyard(game, "Llanowar Elves", B);
    pickFromZone(a, bears);
    pickFromZone(b, elf);
    cast(game, toHand(game, "Exhume"));
    expect(game.eventsOfType("cards-left-graveyard").map((e) => e.objects)).toEqual([[bears, elf]]);
  });
});

describe("Crypt Champion", () => {
  it("each player's card of mana value 3 or less enters together; it stays with {R} spent", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    const angel = toGraveyard(game, "Serra Angel", A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const elf = toGraveyard(game, "Llanowar Elves", B);
    const seen = pickFromZone(a, bears);
    pickFromZone(b, elf);
    const champion = toHand(game, "Crypt Champion");
    cast(game, champion);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, champion)).toBe("battlefield");
  });

  it("is sacrificed without {R}, its first ability still done", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    pickFromZone(a, bears);
    const champion = toHand(game, "Crypt Champion");
    cast(game, champion);
    expect(zone(game, bears)).toBe("battlefield");
    expect(graveyard(game, A)).toContain(champion);
  });
});

describe("Tempting Wurm", () => {
  it("each opponent chooses in turn from their hand, and all of it enters at once", () => {
    const { game, b, c } = table({ players: 3 });
    lands(game, "Forest", 2);
    const bear = toHand(game, "Grizzly Bears", B);
    const land = toHand(game, "Forest", B);
    const spell = toHand(game, "Opt", B);
    const ring = toHand(game, "Sol Ring", C);
    const seen: string[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      seen.push(`bob:${eligible.includes(spell)}`);
      return [bear, land];
    };
    c.chooseFromZoneFn = () => {
      // Bob's choice stays in his hand until Carol has made hers.
      seen.push(`carol:${zone(game, bear)}`);
      return [ring];
    };
    cast(game, toHand(game, "Tempting Wurm"));
    expect(seen).toEqual(["bob:false", "carol:hand"]);
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
    expect(controller(game, ring)).toBe(C);
    expect(hand(game, B)).toContain(spell);
  });

  it("what enters together isn't there for another's replacement (rule 614.12)", () => {
    const { game, b } = table();
    lands(game, "Forest", 2);
    const giada = toHand(game, "Giada, Font of Hope", B);
    const angel = toHand(game, "Serra Angel", B);
    pickFromZone(b, giada, angel);
    cast(game, toHand(game, "Tempting Wurm"));
    expect(zone(game, angel)).toBe("battlefield");
    expect(counters(game, angel)).toBe(0);
  });

  it("an opponent may put none", () => {
    const { game, b } = table();
    lands(game, "Forest", 2);
    const bear = toHand(game, "Grizzly Bears", B);
    pickFromZone(b);
    cast(game, toHand(game, "Tempting Wurm"));
    expect(zone(game, bear)).toBe("hand");
  });
});

describe("Sword of Hearth and Home: both cards enter together", () => {
  const equipped = (game: Game): ObjectId => {
    const carrier = spawn(game, "Grizzly Bears", A);
    const sword = spawn(game, "Sword of Hearth and Home", A);
    lands(game, "Plains", 2);
    activate(game, sword, 0, { targets: [ref(carrier)] });
    expect(game.characteristics(carrier).power).toBe(4);
    expect([...game.characteristics(carrier).protectionFrom.colors].sort()).toEqual(["G", "W"]);
    return carrier;
  };

  it("exiles the target and finds a basic land: both are there, the creature a new object", () => {
    const { game, a } = table();
    const carrier = equipped(game);
    const buddy = spawn(game, "Llanowar Elves", A);
    const land = toLibrary(game, "Forest", A);
    const decoy = toLibrary(game, "Sol Ring", A);
    const stint = game.state.objects[buddy].zoneChangeCount ?? 0;
    pickTargets(a, buddy);
    const seen = pickFromZone(a, land);
    attack(game, a, [carrier]);
    expect(seen.offered).toContain(land);
    expect(seen.offered).not.toContain(decoy);
    expect(zone(game, buddy)).toBe("battlefield");
    expect(game.state.objects[buddy].zoneChangeCount).toBeGreaterThan(stint);
    expect(controller(game, buddy)).toBe(A);
    expect(zone(game, land)).toBe("battlefield");
    expect(life(game, B)).toBe(16);
  });

  it("each sees the other enter: Rampaging Baloths' landfall fires as it comes back", () => {
    const { game, a } = table();
    const carrier = equipped(game);
    const baloths = spawn(game, "Rampaging Baloths", A);
    const land = toLibrary(game, "Forest", A);
    pickTargets(a, baloths);
    pickFromZone(a, land);
    attack(game, a, [carrier]);
    expect(zone(game, baloths)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
    expect(tokensNamed(game, "Beast Token", A)).toBe(1);
  });

  it("the creature comes back though no land is found", () => {
    const { game, a } = table();
    const carrier = equipped(game);
    const buddy = spawn(game, "Llanowar Elves", A);
    const stint = game.state.objects[buddy].zoneChangeCount ?? 0;
    pickTargets(a, buddy);
    pickFromZone(a);
    attack(game, a, [carrier]);
    expect(zone(game, buddy)).toBe("battlefield");
    expect(game.state.objects[buddy].zoneChangeCount).toBeGreaterThan(stint);
  });

  it("with no target it still searches, and the land enters alone", () => {
    const { game, a } = table();
    const carrier = equipped(game);
    const land = toLibrary(game, "Forest", A);
    pickTargets(a, null);
    pickFromZone(a, land);
    attack(game, a, [carrier]);
    expect(zone(game, land)).toBe("battlefield");
  });

  it("asks an exiled Clone what it copies before either card moves", () => {
    const { game, a } = table();
    const carrier = equipped(game);
    a.chooseCopyFn = () => carrier;
    lands(game, "Island", 4);
    const clone = toHand(game, "Clone", A);
    cast(game, clone);
    const land = toLibrary(game, "Forest", A);
    pickTargets(a, clone);
    pickFromZone(a, land);
    let landWas: string | undefined;
    a.chooseCopyFn = () => {
      landWas = zone(game, land);
      return carrier;
    };
    attack(game, a, [carrier]);
    expect(landWas).toBe("library");
    expect(zone(game, clone)).toBe("battlefield");
    expect(game.characteristics(clone).power).toBe(2);
    expect(zone(game, land)).toBe("battlefield");
  });

  it("can't target a creature you don't own", () => {
    const { game, a } = table();
    const carrier = equipped(game);
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a);
    pickFromZone(a);
    attack(game, a, [carrier]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(carrier);
    expect(seen.offered[0]).not.toContain(theirs);
  });
});

describe("Call Damage Control: the modes' targets return at once", () => {
  it("two cards, one move: Tormod makes one Zombie", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Tormod, the Desecrator", A);
    const ring = toGraveyard(game, "Sol Ring", A);
    const land = toGraveyard(game, "Forest", A);
    cast(game, toHand(game, "Call Damage Control"), { modes: [0, 3], targets: [ref(ring), ref(land)] });
    expect(hand(game, A)).toEqual(expect.arrayContaining([ring, land]));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("a target gone illegal leaves the other mode's", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const land = toGraveyard(game, "Forest", A);
    const spell = toHand(game, "Call Damage Control");
    cast(game, spell, { modes: [1, 3], targets: [ref(bears), ref(land)], settle: false });
    game.debugMove(bears, "exile");
    settle(game);
    expect(zone(game, spell)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, A)).toContain(land);
  });

  it("each mode reads its own kind of card", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const spell = toHand(game, "Call Damage Control");
    expect(() => cast(game, spell, { modes: [3], targets: [ref(bears)] })).toThrow();
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("may be cast choosing none, and does nothing", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const spell = toHand(game, "Call Damage Control");
    cast(game, spell, { modes: [], targets: [] });
    expect(zone(game, spell)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});
