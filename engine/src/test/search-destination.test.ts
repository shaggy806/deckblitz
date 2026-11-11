import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  C,
  controller,
  counters,
  enter,
  keywords,
  lands,
  pickModes,
  quiet,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/**
 * `search-library`'s `instead` (each find to a destination of its own: by a
 * condition on the card or the game, by the searcher's choice, a split to
 * the graveyard or to another controller) and `withCounters` (rule 122.6).
 */

/** The seat answers its choose-from-zone decisions in turn, recording each
 * one's eligible cards. */
function answerInTurn(seat: ScriptedController, ...answers: readonly (readonly ObjectId[])[]): (readonly ObjectId[])[] {
  const offered: (readonly ObjectId[])[] = [];
  let next = 0;
  seat.chooseFromZoneFn = (_view, eligible) => {
    offered.push(eligible);
    const answer = answers[next] ?? [];
    next += 1;
    return answer;
  };
  return offered;
}

describe("a split to the graveyard (Jarad's Orders)", () => {
  it("asks which find goes to the hand once both are found; the other goes to the graveyard, then the shuffle", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const elves = toLibrary(game, "Llanowar Elves");
    const offered = answerInTurn(a, [bears, elves], [elves]);
    let prompt: string | undefined;
    const before = game.events.length;
    const orders = toHand(game, "Jarad's Orders");
    game.dispatch({ type: "cast-spell", player: A, card: orders, targets: [] });
    game.advanceUntil((s) => {
      if (s.awaiting?.kind === "choose-from-zone" && s.awaiting.searchRest !== undefined) prompt = s.awaiting.prompt;
      return quiet(s);
    });
    expect(offered).toHaveLength(2);
    expect([...offered[1]].sort()).toEqual([bears, elves].sort());
    expect(prompt).toBe("Choose one to put into your hand — the other goes into your graveyard");
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    // Both revealed, and one shuffle — after the second choice, not between
    // the two (rule 701.24a).
    const events = game.events.slice(before);
    expect(events.filter((e) => e.type === "cards-revealed")).toHaveLength(1);
    expect(events.filter((e) => e.type === "library-shuffled" && e.player === A)).toHaveLength(1);
  });

  it("a single find goes to the hand, unasked (rule 609.3)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const offered = answerInTurn(a, [bears]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Jarad's Orders"), targets: [] });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(1);
    expect(zone(game, bears)).toBe("hand");
    expect(game.eventsOfType("library-shuffled").some((e) => e.player === A)).toBe(true);
  });
});

describe("the searcher's choice of destination (Dina's Guidance)", () => {
  it("picked, the find goes to the graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    answerInTurn(a, [bears], [bears]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Dina's Guidance"), targets: [] });
    game.advanceUntil(quiet);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("not picked, it goes to the hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const offered = answerInTurn(a, [bears], []);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Dina's Guidance"), targets: [] });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(2);
    expect(offered[1]).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(game.eventsOfType("library-shuffled").some((e) => e.player === A)).toBe(true);
  });
});

describe("a condition on the game (Ruin in Their Wake)", () => {
  it("controlling a land named Wastes, the find may go onto the battlefield tapped", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    spawn(game, "Wastes");
    const find = game.state.zones.perPlayer[A].library[0];
    const offered = answerInTurn(a, [find], [find]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Ruin in Their Wake"), targets: [] });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(2);
    expect(zone(game, find)).toBe("battlefield");
    expect(game.state.objects[find].tapped).toBe(true);
  });

  it("without one, the find goes to the hand and nothing more is asked", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const find = game.state.zones.perPlayer[A].library[0];
    const offered = answerInTurn(a, [find], [find]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Ruin in Their Wake"), targets: [] });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(1);
    expect(zone(game, find)).toBe("hand");
  });
});

describe("a condition on the card (Guidelight Pathmaker)", () => {
  it("mana value 2 or less goes onto the battlefield, unasked", () => {
    const { game, a } = table();
    const ring = toLibrary(game, "Sol Ring");
    pickModes(a, 0);
    const offered = answerInTurn(a, [ring]);
    enter(game, "Guidelight Pathmaker");
    expect(offered).toHaveLength(1);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("more goes into the hand", () => {
    const { game, a } = table();
    const solemn = toLibrary(game, "Solemn Simulacrum");
    pickModes(a, 0);
    answerInTurn(a, [solemn]);
    enter(game, "Guidelight Pathmaker");
    expect(zone(game, solemn)).toBe("hand");
    expect(game.eventsOfType("library-shuffled").some((e) => e.player === A)).toBe(true);
  });
});

describe("a split to another controller (Rootweaver Druid)", () => {
  it("each opponent who searches puts one find under the Druid's controller's control and the rest under their own", () => {
    const { game, a, b, c } = table({ players: 3 });
    pickModes(b, 0);
    pickModes(c);
    const [one, two, three] = game.state.zones.perPlayer[B].library.slice(0, 3);
    const offered = answerInTurn(b, [one, two, three], [two]);
    answerInTurn(a);
    const before = game.events.length;
    const carols = game.state.zones.perPlayer[C].library.length;
    enter(game, "Rootweaver Druid");
    expect(offered).toHaveLength(2);
    expect(controller(game, two)).toBe(A);
    expect(controller(game, one)).toBe(B);
    expect(controller(game, three)).toBe(B);
    for (const id of [one, two, three]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
    const shuffles = game.events.slice(before).filter((e) => e.type === "library-shuffled");
    // Carol declined: only Bob searched, so only Bob shuffles.
    expect(shuffles.map((e) => (e.type === "library-shuffled" ? e.player : null))).toEqual([B]);
    expect(game.state.zones.perPlayer[C].library).toHaveLength(carols);
  });
});

describe("withCounters (rule 122.6)", () => {
  it("Neoform's find enters with an additional +1/+1 counter", () => {
    const { game, a } = table();
    spawn(game, "Forest");
    spawn(game, "Island");
    const bears = spawn(game, "Grizzly Bears");
    const witness = toLibrary(game, "Eternal Witness");
    const offered = answerInTurn(a, [witness]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Neoform"), targets: [], sacrifice: bears });
    game.advanceUntil(quiet);
    expect(offered[0]).toEqual([witness]);
    expect(zone(game, witness)).toBe("battlefield");
    expect(counters(game, witness)).toBe(1);
  });

  it("Magmatic Hellkite: the land's controller finds a basic that enters tapped with a stun counter", () => {
    const { game, a, b } = table();
    const tower = spawn(game, "Command Tower", B);
    a.chooseTargetsFn = () => [ref(tower)];
    const find = game.state.zones.perPlayer[B].library[0];
    answerInTurn(b, [find]);
    enter(game, "Magmatic Hellkite");
    expect(zone(game, tower)).toBe("graveyard");
    expect(zone(game, find)).toBe("battlefield");
    expect(controller(game, find)).toBe(B);
    expect(game.state.objects[find].tapped).toBe(true);
    expect(counters(game, find, "stun")).toBe(1);
  });

  it("Vision Quest's find enters with X counters, and haste at X 4 or more", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const solemn = toLibrary(game, "Solemn Simulacrum");
    // "Search your library" — and no to Solemn Simulacrum's own search.
    a.chooseModesFn = (_view, _min, _max, texts) => (texts.length === 3 ? [1] : []);
    answerInTurn(a, [solemn]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Vision Quest"), targets: [], xValue: 4 });
    game.advanceUntil(quiet);
    expect(zone(game, solemn)).toBe("battlefield");
    expect(counters(game, solemn)).toBe(4);
    expect(keywords(game, solemn).has("haste")).toBe(true);
  });
});

describe("two of three finds onto the battlefield, the other to hand (Viewpoint Synchronization)", () => {
  it("asks which two enter tapped once three are found; the third goes to the hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const forest = toLibrary(game, "Forest");
    const island = toLibrary(game, "Island");
    const swamp = toLibrary(game, "Swamp");
    // A nonbasic land isn't one to find.
    const tower = toLibrary(game, "Command Tower");
    const offered = answerInTurn(a, [forest, island, swamp], [island, swamp]);
    const before = game.events.length;
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Viewpoint Synchronization"), targets: [] });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(2);
    // The library's other basic lands are findable too; the nonbasic isn't.
    expect(offered[0]).toEqual(expect.arrayContaining([forest, island, swamp]));
    expect(offered[0]).not.toContain(tower);
    expect([...offered[1]].sort()).toEqual([forest, island, swamp].sort());
    expect(zone(game, island)).toBe("battlefield");
    expect(zone(game, swamp)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
    expect(game.state.objects[swamp].tapped).toBe(true);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, tower)).toBe("library");
    const events = game.events.slice(before);
    expect(events.filter((e) => e.type === "cards-revealed")).toHaveLength(1);
    expect(events.filter((e) => e.type === "library-shuffled" && e.player === A)).toHaveLength(1);
  });

  it("two finds both enter tapped, unasked, and nothing goes to the hand (rule 609.3)", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const island = toLibrary(game, "Island");
    const swamp = toLibrary(game, "Swamp");
    const offered = answerInTurn(a, [island, swamp]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Viewpoint Synchronization"), targets: [] });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(1);
    expect(zone(game, island)).toBe("battlefield");
    expect(zone(game, swamp)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
  });

  it("the searcher may find fewer than are there: one found, it enters tapped", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const island = toLibrary(game, "Island");
    const swamp = toLibrary(game, "Swamp");
    answerInTurn(a, [island]);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Viewpoint Synchronization"), targets: [] });
    game.advanceUntil(quiet);
    expect(zone(game, island)).toBe("battlefield");
    expect(zone(game, swamp)).toBe("library");
  });
});
