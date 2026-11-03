/**
 * `choose-one-of-each`: one for each of several categories, a card standing for
 * several if its player wants (the rulings of Cataclysm, Global Ruin, Planar
 * Overlay and Sundering Titan), then something happening to what was or wasn't
 * chosen, all at once.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import { choosePermanents } from "../decisions/choose-permanents.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { completeTogether, fitsSoFar, fitsTogether, slotsLeft, type ZoneChoiceTogether } from "../zone-choice-together.js";
import {
  A,
  B,
  C,
  D,
  cast,
  destroy,
  hand,
  lands,
  named,
  pickFromZone,
  pickPermanents,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const together = (tags: Record<string, readonly string[]>): ZoneChoiceTogether => ({ rule: "one-of-each", tags, text: "one of each" });
const id = (s: string): ObjectId => s as ObjectId;
const notAsked = (seat: ScriptedController): void => {
  seat.choosePermanentsFn = () => {
    throw new Error("nobody should be asked");
  };
};

describe("the one-of-each rule", () => {
  const rule = together({ tundra: ["Plains", "Island"], plains: ["Plains"], island: ["Island"], forest: ["Forest"] });
  const of = (...names: readonly string[]) => names.map(id);

  it("wants every slot covered", () => {
    expect(fitsTogether(rule, of("tundra", "forest"))).toBe(true);
    expect(fitsTogether(rule, of("plains", "island", "forest"))).toBe(true);
    expect(fitsTogether(rule, of("tundra", "plains", "forest"))).toBe(true);
    expect(fitsTogether(rule, of("plains", "forest"))).toBe(false);
    expect(slotsLeft(rule, of("plains", "forest"))).toEqual(["Island"]);
  });

  it("wants each chosen to be the one chosen for a slot of its own", () => {
    expect(fitsTogether(rule, of("tundra", "plains", "island", "forest"))).toBe(false);
    expect(fitsSoFar(rule, of("tundra", "plains", "island"))).toBe(false);
    expect(fitsSoFar(rule, of("plains"))).toBe(true);
  });

  it("completes a pick into a legal answer", () => {
    const eligible = of("plains", "tundra", "island", "forest");
    const done = completeTogether(rule, of("island"), eligible, 1, 3);
    expect(fitsTogether(rule, done)).toBe(true);
    expect(done).toEqual(of("island", "plains", "forest"));
    expect(fitsTogether(rule, completeTogether(rule, [], eligible, 1, 3))).toBe(true);
  });
});

describe("Cataclysm", () => {
  it("each player keeps one of each type, a planeswalker and the rest going at once", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 4);
    const forest = spawn(game, "Forest", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const lions = spawn(game, "Savannah Lions", A);
    const thopter = spawn(game, "Ornithopter", A);
    const anthem = spawn(game, "Glorious Anthem", A);
    const jace = spawn(game, "Jace Beleren", A);
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Gray Ogre", B);
    const mountain = spawn(game, "Mountain", B);

    pickPermanents(a, forest, bears, thopter, anthem);
    pickPermanents(b, giant, mountain);
    cast(game, toHand(game, "Cataclysm"));

    for (const kept of [forest, bears, thopter, anthem, giant, mountain]) expect(zone(game, kept)).toBe("battlefield");
    for (const gone of [lions, jace, ogre]) expect(zone(game, gone)).toBe("graveyard");
    expect(named(game, "Plains", A)).toHaveLength(0);
  });

  it("an artifact creature may be both", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 4);
    const thopter = spawn(game, "Ornithopter", A);
    const bears = spawn(game, "Grizzly Bears", A);
    pickPermanents(a, thopter, plains[0]);
    cast(game, toHand(game, "Cataclysm"));
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, plains[0])).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("an artifact creature may be either, with another for the other", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 4);
    const thopter = spawn(game, "Ornithopter", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const lions = spawn(game, "Savannah Lions", A);
    pickPermanents(a, thopter, bears, plains[0]);
    cast(game, toHand(game, "Cataclysm"));
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, lions)).toBe("graveyard");
  });

  it("refuses a slot left empty, and two for one slot", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 4);
    const thopter = spawn(game, "Ornithopter", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const lions = spawn(game, "Savannah Lions", A);
    const refusals: (string | null)[] = [];
    a.choosePermanentsFn = () => {
      const why = (...permanents: readonly ObjectId[]): string | null =>
        game.canDispatch({ type: "choose-permanents", player: A, permanents });
      refusals.push(why(thopter, plains[0]), why(thopter, bears, plains[0]), why(bears, plains[0]), why(bears, lions, plains[0]));
      return [thopter, plains[0]];
    };
    cast(game, toHand(game, "Cataclysm"));
    expect(refusals[0]).toBeNull();
    expect(refusals[1]).toBeNull();
    expect(refusals[2]).toMatch(/one for each/);
    expect(refusals[3]).toMatch(/one for each/);
  });

  it("a stack of artifact creature tokens can give one for each of two slots, and the rest go", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 4);
    const stack = spawn(game, "Thopter Token", A);
    game.state.objects[stack].stackCount = 4;
    let offer: LegalAction | undefined;
    a.choosePermanentsFn = (view) => {
      offer = view.legalActions().find((o) => o.kind === "choose-permanents");
      return [stack, stack, plains[0]];
    };
    cast(game, toHand(game, "Cataclysm"));
    expect(offer).toMatchObject({ copies: { [stack]: 2 }, max: 3 });
    const left = game.state.zones.shared.battlefield.filter((o) => game.state.objects[o].cardName === "Thopter Token");
    expect(left.reduce((n, o) => n + (game.state.objects[o].stackCount ?? 1), 0)).toBe(2);
  });
});

describe("Global Ruin", () => {
  it("a dual stands for both, a land with no basic type goes", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 5);
    const tundra = spawn(game, "Tundra", A);
    const island = spawn(game, "Island", A);
    const quarter = spawn(game, "Ghost Quarter", A);
    const forest = spawn(game, "Forest", B);
    const other = spawn(game, "Forest", B);
    pickPermanents(a, tundra);
    pickPermanents(b, other);
    cast(game, toHand(game, "Global Ruin"));
    expect(zone(game, tundra)).toBe("battlefield");
    expect(zone(game, island)).toBe("graveyard");
    expect(zone(game, quarter)).toBe("graveyard");
    expect(named(game, "Plains", A)).toHaveLength(0);
    expect(zone(game, other)).toBe("battlefield");
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("asks nobody with one answer, and a player with no land of a type has nothing to keep", () => {
    const { game, a, b } = table();
    const plains = lands(game, "Plains", 5);
    const forest = spawn(game, "Forest", B);
    const mountain = spawn(game, "Mountain", B);
    const quarter = spawn(game, "Ghost Quarter", B);
    pickPermanents(a, plains[0]);
    notAsked(b);
    cast(game, toHand(game, "Global Ruin"));
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, mountain)).toBe("battlefield");
    expect(zone(game, quarter)).toBe("graveyard");
  });

  it("in a four-player game, asks each in turn order", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const order: PlayerId[] = [];
    lands(game, "Plains", 5);
    a.choosePermanentsFn = (_view, eligible) => {
      order.push(A);
      return [eligible[0]];
    };
    const seat = (s: ScriptedController, player: PlayerId): void => {
      spawn(game, "Swamp", player);
      const keep = spawn(game, "Swamp", player);
      s.choosePermanentsFn = () => {
        order.push(player);
        return [keep];
      };
    };
    seat(b, B);
    seat(c, C);
    seat(d, D);
    cast(game, toHand(game, "Global Ruin"));
    expect(order).toEqual([A, B, C, D]);
    for (const player of [B, C, D]) expect(named(game, "Swamp", player)).toHaveLength(1);
  });
});

describe("Planar Overlay", () => {
  it("returns each player's choice to its owner's hand together, leaving the rest", () => {
    const { game, a, b } = table();
    const islands = lands(game, "Island", 3);
    const plains = spawn(game, "Plains", A);
    const stayed = spawn(game, "Plains", A);
    const swamp = spawn(game, "Swamp", B);
    const other = spawn(game, "Swamp", B);
    pickPermanents(a, plains, islands[0]);
    pickPermanents(b, swamp);
    cast(game, toHand(game, "Planar Overlay"));
    expect(hand(game, A)).toContain(plains);
    expect(hand(game, A)).toContain(islands[0]);
    expect(zone(game, stayed)).toBe("battlefield");
    expect(zone(game, islands[1])).toBe("battlefield");
    expect(hand(game, B)).toContain(swamp);
    expect(zone(game, other)).toBe("battlefield");
  });
});

describe("Sundering Titan", () => {
  it("chooses among every player's lands as it enters and as it leaves, and destroys them together", () => {
    const { game, a } = table();
    const mine = spawn(game, "Plains", A);
    const plainsB = spawn(game, "Plains", B);
    const islandB = spawn(game, "Island", B);
    const onlyMine = spawn(game, "Swamp", A);
    const seen = pickPermanents(a, plainsB, islandB, onlyMine);
    lands(game, "Wastes", 8);
    const titan = toHand(game, "Sundering Titan");
    cast(game, titan);
    expect(seen.offered).toEqual(expect.arrayContaining([mine, plainsB, islandB, onlyMine]));
    expect(zone(game, titan)).toBe("battlefield");
    for (const gone of [plainsB, islandB, onlyMine]) expect(zone(game, gone)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");

    // Leaving: only one land of a type is left, so nobody is asked.
    notAsked(a);
    destroy(game, titan);
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Noxious Vapors", () => {
  it("reveals, keeps one of each color and the lands, discards the other nonlands", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bolt = toHand(game, "Lightning Bolt");
    const shock = toHand(game, "Shock");
    const bears = toHand(game, "Grizzly Bears");
    const forest = toHand(game, "Forest");
    const thopter = toHand(game, "Ornithopter");
    const seen = pickFromZone(a, shock, bears);
    cast(game, toHand(game, "Noxious Vapors"));
    expect(seen.offered).toEqual(expect.arrayContaining([bolt, shock, bears]));
    expect(seen.offered).not.toContain(thopter);
    expect(seen.offered).not.toContain(forest);
    expect(zone(game, shock)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("graveyard");
  });
});

describe("the bots' answers", () => {
  it("every candidate obeys the rule, and one takes theirs where it can", () => {
    const rule = together({ a: ["artifact", "creature"], b: ["creature"], c: ["land"], d: ["land"] });
    const legal: Extract<LegalAction, { kind: "choose-permanents" }> = {
      kind: "choose-permanents",
      eligible: [id("a"), id("b"), id("c"), id("d")],
      min: 1,
      max: 3,
      prompt: "",
      together: rule,
    };
    const candidates = choosePermanents.candidates as unknown as (l: LegalAction, p: PlayerId, n: number, h: unknown) => Action[];
    const answers = candidates(legal, A, 8, {
      order: (ids: readonly ObjectId[]) => [...ids],
      controllerOf: (o: ObjectId) => (o === id("b") || o === id("d") ? B : A),
    });
    expect(answers.length).toBeGreaterThan(1);
    const picks = answers.flatMap((answer) => (answer.type === "choose-permanents" ? [answer.permanents] : []));
    for (const permanents of picks) expect(fitsTogether(rule, permanents)).toBe(true);
    expect(picks.some((p) => p.includes(id("d")) && !p.includes(id("c")))).toBe(true);
  });
});
