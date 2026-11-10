/**
 * A Saga chapter that divides an amount among its targets (rule 603.3d):
 * `SagaChapter.divided`, a triggered ability's, split as the chapter ability
 * is put on the stack. Vorinclex // The Grand Evolution is the card that
 * waited on it, and is played here through both faces.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { ScriptedController } from "../controller.js";

const nameOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

/** Vorinclex flipped into The Grand Evolution on alice's turn 1, chapter I
 * resolved: `bears` and `giant` were milled and put onto the battlefield. */
function evolved(): { game: Game; a: ScriptedController; saga: ObjectId; bears: ObjectId; giant: ObjectId } {
  const { game, a } = table();
  const vorinclex = spawn(game, "Vorinclex");
  lands(game, "Forest", 8);
  for (let i = 0; i < 7; i++) toLibrary(game, "Wastes");
  const elves = toLibrary(game, "Llanowar Elves");
  const giant = toLibrary(game, "Hill Giant");
  const bears = toLibrary(game, "Grizzly Bears");
  // A creature card already in the graveyard isn't among the milled cards.
  toGraveyard(game, "Gray Ogre");
  const milled = pickFromZone(a, bears, giant);
  activate(game, vorinclex, 0);
  expect(nameOf(game, vorinclex)).toBe("The Grand Evolution");
  expect(game.state.objects[vorinclex].counters.lore).toBe(1);
  // Ten cards milled; only the creature cards among them were offered.
  expect([...milled.offered].sort()).toEqual([bears, giant, elves].sort());
  expect(zone(game, bears)).toBe("battlefield");
  expect(zone(game, giant)).toBe("battlefield");
  expect(zone(game, elves)).toBe("graveyard");
  return { game, a, saga: vorinclex, bears, giant };
}

describe("Vorinclex", () => {
  it("has reach and trample, and fetches up to two Forest cards as it enters", () => {
    const { game, a } = table({ deck: "Forest" });
    const library = game.state.zones.perPlayer[A].library;
    const picked = pickFromZone(a, library[0], library[1]);
    const before = hand(game).length;
    const vorinclex = enter(game, "Vorinclex");
    expect(keywords(game, vorinclex).has("reach")).toBe(true);
    expect(keywords(game, vorinclex).has("trample")).toBe(true);
    expect(picked.offered.length).toBeGreaterThan(2);
    expect(hand(game).length).toBe(before + 2);
  });

  it("transforms only at sorcery speed, for {6}{G}{G}", () => {
    const { game } = table();
    const vorinclex = spawn(game, "Vorinclex");
    lands(game, "Forest", 7);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: vorinclex, abilityIndex: 0, targets: [] })).not.toBeNull();
    lands(game, "Forest", 1);
    toStep(game, "upkeep", B);
    game.advanceUntil((s) => s.priority.holder === A);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: vorinclex, abilityIndex: 0, targets: [] })).not.toBeNull();
  });
});

describe("Revival of the Ancestors", () => {
  it("makes three Spirits, spreads three counters over them, then gives trample and lifelink", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const saga = toHand(game, "Revival of the Ancestors");
    cast(game, saga);
    const spirits = named(game, "Spirit Token (Great Arashin City)", A);
    const total = spirits.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(total).toBe(3);
    // Chapter II: the tokens split apart as they're targeted, one counter each.
    a.chooseTargetsFn = (_view, _source, _specs, legal) => legal[0].slice(0, 3);
    toStep(game, "precombat-main", A);
    settle(game);
    const now = named(game, "Spirit Token (Great Arashin City)", A);
    expect(now.map((id) => counters(game, id)).sort()).toEqual([1, 1, 1]);
    // Chapter III, then the Saga is sacrificed (rule 714.4).
    toStep(game, "precombat-main", A);
    settle(game);
    expect(now.every((id) => keywords(game, id).has("trample") && keywords(game, id).has("lifelink"))).toBe(true);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("The Grand Evolution", () => {
  it("chapter I mills ten and puts up to two milled creature cards onto the battlefield", () => {
    const { game } = evolved();
    // Eight of the ten milled cards stayed, beside the Ogre already there.
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(9);
  });

  it("chapter II distributes seven +1/+1 counters as chosen when it's put on the stack", () => {
    const { game, saga, bears, giant } = evolved();
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" && s.turn.number > 1);
    expect(game.state.objects[saga].counters.lore).toBe(2);
    const asked = game.state.awaiting;
    expect(asked?.kind === "choose-targets" ? asked.divide?.total : undefined).toBe(7);
    // At least one to each target (rule 601.2d): seven on nothing but two.
    expect(
      game.canDispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(giant)], division: [7, 0] }),
    ).not.toBeNull();
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(giant)], division: [5, 2] });
    settle(game);
    expect(counters(game, bears)).toBe(5);
    expect(counters(game, giant)).toBe(2);
  });

  it("chapter II with one target puts all seven there, and with none distributes nothing", () => {
    const one = evolved();
    pickTargets(one.a, one.bears);
    toStep(one.game, "precombat-main", A);
    settle(one.game);
    expect(counters(one.game, one.bears)).toBe(7);

    const none = evolved();
    pickTargets(none.a);
    toStep(none.game, "precombat-main", A);
    settle(none.game);
    expect(none.game.state.objects[none.saga].counters.lore).toBe(2);
    expect(counters(none.game, none.bears)).toBe(0);
    expect(counters(none.game, none.giant)).toBe(0);
  });

  it("chapter III gives the creatures there a fight ability this turn, then returns as Vorinclex", () => {
    const { game, a, saga, bears } = evolved();
    pickTargets(a, bears);
    toStep(game, "precombat-main", A);
    settle(game);
    const ogre = spawn(game, "Gray Ogre", B);
    pickFromZone(a);
    toStep(game, "precombat-main", A);
    settle(game);
    // Back front face up, a new object with no lore counters (rule 400.7).
    expect(nameOf(game, saga)).toBe("Vorinclex");
    expect(zone(game, saga)).toBe("battlefield");
    expect(game.state.objects[saga].counters.lore ?? 0).toBe(0);
    const fightOf = (id: ObjectId): number | undefined =>
      game
        .legalActions(A)
        .flatMap((action) => (action.kind === "activate-ability" && action.source === id ? [action] : []))
        .find((action) => /fights target creature/.test(action.text))?.abilityIndex;
    const fights = (id: ObjectId): number => (fightOf(id) === undefined ? 0 : 1);
    // The set was fixed as the chapter resolved: Vorinclex wasn't there.
    expect(fights(bears)).toBe(1);
    expect(fights(saga)).toBe(0);
    const late = spawn(game, "Hill Giant");
    expect(fights(late)).toBe(0);
    // The 9/9 Bears (2/2 with seven counters) fights the 2/2 Ogre.
    activate(game, bears, fightOf(bears), { targets: [ref(ogre)] });
    expect(zone(game, ogre)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(2);
    // Gone at end of turn.
    toStep(game, "precombat-main", A);
    expect(fights(bears)).toBe(0);
    expect(named(game, "Vorinclex", A)).toEqual([saga]);
  });
});
