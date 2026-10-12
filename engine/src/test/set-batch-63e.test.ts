/**
 * The set walk, batch 63, part e (2026-10-12): Lorwyn Eclipsed's blight cards,
 * unblocked by the blight keyword action (rule 701.68 — `blight.test.ts` has
 * the mechanic's own tests). Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
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

const faceName = (game: Game, id: ObjectId): string =>
  (game.state.objects[id].face ?? 0) === 0 ? game.state.objects[id].cardName : "Grub, Notorious Auntie";

describe("Gristle Glutton", () => {
  it("{T}, Blight 1: discards a card, then draws one", () => {
    const { game, a } = table();
    const glutton = spawn(game, "Gristle Glutton");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const before = hand(game).length;
    activate(game, glutton);
    expect(counters(game, glutton, "-1/-1")).toBe(1);
    expect(graveyard(game)).toEqual([bolt]);
    expect(hand(game).length).toBe(before);
  });

  it("is a 1/3 that can't activate again while tapped", () => {
    const { game } = table();
    const glutton = spawn(game, "Gristle Glutton");
    activate(game, glutton);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: glutton, abilityIndex: 0, targets: [] }),
    ).toMatch(/tapped/);
  });
});

describe("Bogslither's Embrace", () => {
  it("exiles target creature for {1}{B} and a blight, or {4}{B}", () => {
    const { game, a } = table();
    spawn(game, "Swamp");
    lands(game, "Wastes", 1);
    const mine = spawn(game, "Gristle Glutton");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, mine);
    cast(game, toHand(game, "Bogslither's Embrace"), { targets: [ref(theirs)], costOption: 0 });
    expect(zone(game, theirs)).toBe("exile");
    expect(counters(game, mine, "-1/-1")).toBe(1);
  });
});

describe("Wild Unraveling", () => {
  it("counters target spell for {U}{U} and {1} without a creature", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Wastes", 1);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const unraveling = toHand(game, "Wild Unraveling");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, unraveling, { targets: [ref(bolt)], costOption: 1 });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Burning Curiosity", () => {
  it("the exiled cards can be played until the end of your next turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Grizzly Bears");
    toLibrary(game, "Mountain");
    const bolt = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Mountain");
    cast(game, toHand(game, "Burning Curiosity"), { kicked: true });
    expect(zone(game, bolt)).toBe("exile");
    // Alice's next turn: still castable.
    toStep(game, "precombat-main");
    lands(game, "Mountain", 1);
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bolt)).toBe(true);
  });
});

describe("Boggart Mischief", () => {
  it("each Goblin creature of yours that dies drains each opponent for 1", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    enter(game, "Boggart Mischief");
    expect(tokensNamed(game, "Goblin Token (Boggart Mischief)", A)).toBe(2);
    const [goblin] = named(game, "Goblin Token (Boggart Mischief)", A);
    destroy(game, goblin);
    expect(life(game, B)).toBe(19);
    expect(life(game, "carol" as never)).toBe(19);
    expect(life(game)).toBe(21);
    // A non-Goblin dying drains nothing.
    destroy(game, bears);
    expect(life(game)).toBe(21);
  });
});

describe("Scuzzback Scrounger", () => {
  it("at the beginning of your first main phase, may blight 1 for a Treasure", () => {
    const { game, a } = table();
    const scrounger = spawn(game, "Scuzzback Scrounger");
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, scrounger, "-1/-1")).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("not in an opponent's first main phase", () => {
    const { game, a } = table();
    const scrounger = spawn(game, "Scuzzback Scrounger");
    pickModes(a, 0);
    toStep(game, "precombat-main", B);
    settle(game);
    expect(counters(game, scrounger, "-1/-1")).toBe(0);
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
  });
});

describe("High Perfect Morcant", () => {
  it("another Elf entering makes each opponent blight 1", () => {
    const { game } = table();
    spawn(game, "High Perfect Morcant");
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Llanowar Elves");
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });

  it("tap three untapped Elves: proliferate, only as a sorcery — Morcant may be one of them", () => {
    const { game, a } = table();
    const morcant = spawn(game, "High Perfect Morcant");
    const elves = [spawn(game, "Llanowar Elves"), spawn(game, "Elvish Mystic")];
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["-1/-1"] = 1;
    a.chooseProliferateFn = () => [ref(bears)];
    activate(game, morcant);
    // A second -1/-1 counter: the 2/2 is 0/0.
    expect(zone(game, bears)).toBe("graveyard");
    expect([morcant, ...elves].every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Grub, Storied Matriarch // Grub, Notorious Auntie", () => {
  it("returns up to one Goblin card from your graveyard as it enters", () => {
    const { game, a } = table();
    const glutton = toGraveyard(game, "Gristle Glutton");
    toGraveyard(game, "Grizzly Bears");
    pickTargets(a, glutton);
    enter(game, "Grub, Storied Matriarch");
    expect(zone(game, glutton)).toBe("hand");
  });

  it("pays {R} to transform in your first main phase, then {B} back — returning a Goblin again as it does", () => {
    const { game, a } = table();
    const grub = spawn(game, "Grub, Storied Matriarch");
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    expect(faceName(game, grub)).toBe("Grub, Notorious Auntie");
    const glutton = toGraveyard(game, "Gristle Glutton");
    pickTargets(a, glutton);
    toStep(game, "precombat-main");
    settle(game);
    expect(faceName(game, grub)).toBe("Grub, Storied Matriarch");
    expect(zone(game, glutton)).toBe("hand");
  });

  it("blighting Grub herself copies her: the legend rule keeps one", () => {
    const { game, a } = table();
    const grub = spawn(game, "Grub, Storied Matriarch");
    game.state.objects[grub].face = 1;
    pickModes(a, 0);
    attack(game, a, [grub]);
    // Grub got the counter (2/0) and died; the copy, a 2/1 Notorious Auntie
    // attacking, dealt its 2.
    expect(zone(game, grub)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    toStep(game, "end");
    settle(game);
    expect(game.battlefield.filter((id) => game.state.objects[id].isToken)).toEqual([]);
  });
});
