/**
 * Durations ending at a point in a later turn (`PointDuration`): "until
 * your next upkeep", "until the end of your next upkeep", "until the end of
 * your next turn", "until its controller's next untap step" — and the same
 * moments for a permission over an exiled card ("until the beginning of your
 * next upkeep", "until your next turn"). Rules 500.4, 500.5, 514.2, 614.10a,
 * 800.4m.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

/** On `turn`, in `step`, with `player` holding priority. */
const at = (game: Game, turn: number, step: GameState["turn"]["step"], player: PlayerId = A): void =>
  game.advanceUntil((s) => s.turn.number === turn && s.turn.step === step && s.priority.holder === player);

const playable = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

describe('"until your next upkeep" (Xenic Poltergeist)', () => {
  it("lasts through the other turns and ends as that upkeep begins", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone");
    activate(game, spawn(game, "Xenic Poltergeist"), 0, { targets: [ref(stone)] });
    expect(types(game, stone)).toContain("creature");
    expect(pt(game, stone)).toEqual({ power: 2, toughness: 2 });
    at(game, 2, "upkeep", B);
    expect(types(game, stone)).toContain("creature");
    at(game, 2, "end", B);
    expect(types(game, stone)).toContain("creature");
    at(game, 3, "upkeep");
    expect(types(game, stone)).not.toContain("creature");
  });

  it("is the effect's controller's upkeep, whoever controls the artifact", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone");
    const poltergeist = spawn(game, "Xenic Poltergeist", B);
    game.advanceUntil((s) => s.priority.holder === B);
    activate(game, poltergeist, 0, { player: B, targets: [ref(stone)] });
    at(game, 2, "upkeep", B);
    expect(types(game, stone)).not.toContain("creature");
  });

  it("waits past a skipped upkeep (rule 614.10a)", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone");
    const hub = spawn(game, "Eon Hub");
    activate(game, spawn(game, "Xenic Poltergeist"), 0, { targets: [ref(stone)] });
    at(game, 3, "draw");
    expect(types(game, stone)).toContain("creature");
    destroy(game, hub);
    at(game, 5, "upkeep");
    expect(types(game, stone)).not.toContain("creature");
  });

  it("ends as the turn of a player who has left would have begun (rule 800.4m)", () => {
    const { game } = table({ players: 4 });
    const stone = spawn(game, "Mind Stone");
    const poltergeist = spawn(game, "Xenic Poltergeist", B);
    game.advanceUntil((s) => s.priority.holder === B);
    activate(game, poltergeist, 0, { player: B, targets: [ref(stone)] });
    game.concede(B);
    expect(types(game, stone)).toContain("creature");
    at(game, 2, "upkeep", C);
    expect(types(game, stone)).not.toContain("creature");
  });
});

describe('"until the end of your next upkeep" (Halfdane)', () => {
  it("runs through that upkeep, so a new target takes over without a gap", () => {
    const { game, a } = table();
    const halfdane = spawn(game, "Halfdane");
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, bears);
    at(game, 3, "draw");
    expect(pt(game, halfdane)).toEqual({ power: 2, toughness: 2 });
    at(game, 4, "end", B);
    expect(pt(game, halfdane)).toEqual({ power: 2, toughness: 2 });
    pickTargets(a, wurm);
    at(game, 5, "draw");
    // The new effect is newer, and made during this upkeep: it goes on.
    expect(pt(game, halfdane)).toEqual({ power: 6, toughness: 4 });
    at(game, 6, "end", B);
    expect(pt(game, halfdane)).toEqual({ power: 6, toughness: 4 });
  });

  it("holds through the upkeep with no new target, and ends with it (rule 500.5)", () => {
    const { game, a } = table();
    const halfdane = spawn(game, "Halfdane");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    at(game, 3, "draw");
    expect(pt(game, halfdane)).toEqual({ power: 6, toughness: 4 });
    destroy(game, wurm);
    at(game, 5, "upkeep");
    expect(pt(game, halfdane)).toEqual({ power: 6, toughness: 4 });
    at(game, 5, "draw");
    expect(pt(game, halfdane)).toEqual({ power: 3, toughness: 3 });
  });
});

describe('the ability you choose "until your next upkeep" (Gabriel Angelfire)', () => {
  it("is chosen as it resolves, and the last choice has ended before the next", () => {
    const { game, a } = table();
    const gabriel = spawn(game, "Gabriel Angelfire");
    pickModes(a, 0);
    at(game, 3, "draw");
    expect(keywords(game, gabriel).has("flying")).toBe(true);
    at(game, 4, "end", B);
    expect(keywords(game, gabriel).has("flying")).toBe(true);
    pickModes(a, 2);
    at(game, 5, "draw");
    expect(keywords(game, gabriel).has("flying")).toBe(false);
    expect(keywords(game, gabriel).has("trample")).toBe(true);
  });

  it("gives rampage 3", () => {
    const { game, a, b } = table();
    const gabriel = spawn(game, "Gabriel Angelfire");
    pickModes(a, 3);
    at(game, 3, "precombat-main");
    const walls = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    b.declareBlockersFn = () => walls.map((blocker) => ({ blocker, attacker: gabriel }));
    a.declareAttackersFn = () => [{ attacker: gabriel, defender: B }];
    at(game, 3, "declare-blockers");
    settle(game);
    expect(pt(game, gabriel)).toEqual({ power: 7, toughness: 7 });
  });
});

describe('"until your next upkeep", then a counter at it (Cycle of Life)', () => {
  it("is a creature you cast this turn: 0/1, and at your next upkeep its own size and a counter", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const cycle = spawn(game, "Cycle of Life");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    activate(game, cycle, 0, { targets: [ref(bears)] });
    expect(zone(game, cycle)).toBe("hand");
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 1 });
    at(game, 2, "end", B);
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 1 });
    at(game, 3, "draw");
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("can't target a creature that wasn't cast this turn", () => {
    const { game } = table();
    const cycle = spawn(game, "Cycle of Life");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, cycle, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe('"until its controller\'s next untap step" (Orcish Farmer)', () => {
  it("ends as that player's untap step begins, not another's", () => {
    const { game } = table();
    const mine = spawn(game, "Forest");
    const bobs = spawn(game, "Forest", B);
    activate(game, spawn(game, "Orcish Farmer"), 0, { targets: [ref(mine)] });
    activate(game, spawn(game, "Orcish Farmer"), 0, { targets: [ref(bobs)] });
    expect(subtypes(game, mine)).toEqual(["Swamp"]);
    expect(subtypes(game, bobs)).toEqual(["Swamp"]);
    at(game, 2, "upkeep", B);
    expect(subtypes(game, mine)).toEqual(["Swamp"]);
    expect(subtypes(game, bobs)).toEqual(["Forest"]);
    at(game, 3, "upkeep");
    expect(subtypes(game, mine)).toEqual(["Forest"]);
  });

  it("waits past a skipped untap step (rule 614.10a)", () => {
    const { game } = table();
    const stasis = spawn(game, "Stasis");
    const bobs = spawn(game, "Forest", B);
    activate(game, spawn(game, "Orcish Farmer"), 0, { targets: [ref(bobs)] });
    at(game, 2, "upkeep", B);
    expect(subtypes(game, bobs)).toEqual(["Swamp"]);
    destroy(game, stasis);
    at(game, 4, "upkeep", B);
    expect(subtypes(game, bobs)).toEqual(["Forest"]);
  });

  it("is whoever controls it when an untap step begins", () => {
    const { game } = table();
    const bobs = spawn(game, "Forest", B);
    activate(game, spawn(game, "Orcish Farmer"), 0, { targets: [ref(bobs)] });
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bobs)]);
    expect(controller(game, bobs)).toBe(A);
    at(game, 2, "upkeep", B);
    expect(subtypes(game, bobs)).toEqual(["Swamp"]);
    at(game, 3, "upkeep");
    expect(subtypes(game, bobs)).toEqual(["Forest"]);
  });
});

describe('"until the end of your next turn" on a permanent (Stilt-Man, Towering Terror)', () => {
  it("gives control and can't-be-sacrificed through that turn, and they end with it", () => {
    const { game, a } = table();
    const stilt = spawn(game, "Stilt-Man, Towering Terror");
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    attack(game, a, [stilt]);
    expect(controller(game, ring)).toBe(A);
    expect(game.characteristics(ring).cantBeSacrificed).toBe(true);
    at(game, 2, "end", B);
    expect(controller(game, ring)).toBe(A);
    at(game, 3, "end");
    expect(controller(game, ring)).toBe(A);
    expect(game.characteristics(ring).cantBeSacrificed).toBe(true);
    at(game, 4, "upkeep", B);
    expect(controller(game, ring)).toBe(B);
    expect(game.characteristics(ring).cantBeSacrificed).toBe(false);
  });

  it("outlasts an until-end-of-turn control effect, before it or after", () => {
    const { game } = table();
    const first = spawn(game, "Sol Ring", B);
    const second = spawn(game, "Sol Ring", B);
    const untilNextTurn = { kind: "gain-control", target: 0, untilEndOfTurn: false, until: "until-end-of-your-next-turn" } as const;
    const thisTurn = { kind: "gain-control", target: 0, untilEndOfTurn: true } as const;
    game.debugApplyEffect(A, thisTurn, [ref(first)]);
    game.debugApplyEffect(A, untilNextTurn, [ref(first)]);
    game.debugApplyEffect(A, untilNextTurn, [ref(second)]);
    game.debugApplyEffect(A, thisTurn, [ref(second)]);
    at(game, 2, "upkeep", B);
    expect(controller(game, first)).toBe(A);
    expect(controller(game, second)).toBe(A);
    at(game, 4, "upkeep", B);
    expect(controller(game, first)).toBe(B);
    expect(controller(game, second)).toBe(B);
  });
});

describe('"until the beginning of your next upkeep", you may play it (Elkin Bottle)', () => {
  it("plays it until then, a land too, and not at that upkeep", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, spawn(game, "Elkin Bottle"), 0);
    expect(zone(game, bolt)).toBe("exile");
    expect(playable(game, bolt)).toBe(false); // No red mana: the permission alone isn't the cast.
    const mountain = spawn(game, "Mountain");
    expect(playable(game, bolt)).toBe(true);
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(true);
    at(game, 3, "upkeep");
    expect(game.state.objects[mountain].tapped).toBe(false);
    expect(playable(game, bolt)).toBe(false);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("plays a land", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const forest = toLibrary(game, "Forest");
    activate(game, spawn(game, "Elkin Bottle"), 0);
    expect(playable(game, forest)).toBe(true);
  });
});

describe('"until your next turn", you may cast it (Nivix, Aerie of the Firemind)', () => {
  it("casts an instant or sorcery until then, and ends as that turn begins", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, spawn(game, "Nivix, Aerie of the Firemind"), 1);
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Mountain", 1);
    expect(playable(game, bolt)).toBe(true);
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(true);
    at(game, 3, "upkeep");
    expect(playable(game, bolt)).toBe(false);
  });

  it("is no permission over anything else", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 1);
    const forest = toLibrary(game, "Forest");
    activate(game, spawn(game, "Nivix, Aerie of the Firemind"), 1);
    expect(zone(game, forest)).toBe("exile");
    expect(playable(game, forest)).toBe(false);
  });
});

describe('exile target creature, "until the end of your next turn" (Hurl Through Hell)', () => {
  it("casts it with mana of any color, under you, up to that turn's end", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hurl Through Hell"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    at(game, 3, "precombat-main");
    expect(playable(game, bears)).toBe(true);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("ends with that turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hurl Through Hell"), { targets: [ref(bears)] });
    at(game, 3, "end");
    expect(game.state.objects[bears].playPermission).toBeDefined();
    at(game, 4, "upkeep", B);
    expect(game.state.objects[bears].playPermission).toBeUndefined();
  });
});
