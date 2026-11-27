/**
 * "Look at target player's hand" (the `look-at-hand` effect) and "choose up
 * to X cards from it" (`discard-chosen`'s `upTo`): a look is a
 * `choose-from-zone` with nothing to pick, shown to the looker alone.
 */
import { describe, expect, it } from "vitest";
import type { PlayerView } from "../view.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, cast, counters, enter, graveyard, hand, lands, nextTurn, pickModes, pickTargets, ref, spawn, table, toHand } from "./harness.js";

describe("look at target player's hand", () => {
  it("Sorcerous Sight shows Bob's hand to Alice alone, then draws", () => {
    const { game, a } = table();
    const bobsHand = [...hand(game, B)];
    let looked: { view: PlayerView; eligible: readonly ObjectId[]; max: number } | undefined;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      looked = { view: game.viewFor(A), eligible, max };
      // Nobody else sees it.
      const bobsView = game.viewFor(B);
      expect(bobsView.awaiting?.kind).toBe("choose-from-zone");
      return [];
    };
    lands(game, "Island", 1);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Sorcerous Sight"), { targets: [ref(B)] });
    expect(looked).toBeDefined();
    expect(looked!.eligible).toEqual([]);
    expect(looked!.max).toBe(0);
    // Alice's view names every card in Bob's hand while she looks.
    for (const id of bobsHand) expect(looked!.view.objects[id]?.cardName).toBe(game.state.objects[id].cardName);
    // Nothing left Bob's hand, and nothing was revealed to the table.
    expect(hand(game, B)).toEqual(bobsHand);
    expect(hand(game, A).length).toBe(before + 1); // the draw
  });

  it("an opponent sees none of the looked-at cards", () => {
    const { game, a } = table({ players: 3 });
    const bobsHand = [...hand(game, B)];
    let carolSaw: PlayerView | undefined;
    a.chooseFromZoneFn = () => {
      carolSaw = game.viewFor(C);
      return [];
    };
    lands(game, "Island", 1);
    activate(game, spawn(game, "Glasses of Urza"), 0, { targets: [ref(B)] });
    expect(carolSaw).toBeDefined();
    for (const id of bobsHand) expect(carolSaw!.objects[id]).toBeUndefined();
  });

  it("Talas Explorer's enters trigger looks at an opponent's hand", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      expect(eligible).toEqual([]);
      return [];
    };
    pickTargets(a, B);
    enter(game, "Talas Explorer");
    expect(asked).toBe(1);
  });
});

describe("Discordant Dirge: choose up to X cards", () => {
  it("discards up to as many cards as it had verse counters", () => {
    const { game, a } = table();
    const dirge = spawn(game, "Discordant Dirge");
    game.state.objects[dirge].counters = { verse: 2 };
    expect(counters(game, dirge, "verse")).toBe(2);
    const bobsHand = [...hand(game, B)];
    let offered: { eligible: readonly ObjectId[]; min: number; max: number } | undefined;
    a.chooseFromZoneFn = (_view, eligible, min, max) => {
      offered = { eligible, min, max };
      return eligible.slice(0, 2);
    };
    lands(game, "Swamp", 1);
    activate(game, dirge, 0, { targets: [ref(B)] });
    expect(offered).toEqual({ eligible: bobsHand, min: 0, max: 2 });
    expect(hand(game, B).length).toBe(bobsHand.length - 2);
    expect(graveyard(game, B)).toEqual(expect.arrayContaining(bobsHand.slice(0, 2)));
  });

  it("with no verse counters it is only a look", () => {
    const { game, a } = table();
    const dirge = spawn(game, "Discordant Dirge");
    let max = -1;
    a.chooseFromZoneFn = (_view, _eligible, _min, m) => {
      max = m;
      return [];
    };
    lands(game, "Swamp", 1);
    const bobs = hand(game, B).length;
    activate(game, dirge, 0, { targets: [ref(B)] });
    expect(max).toBe(0);
    expect(hand(game, B).length).toBe(bobs);
  });

  it("puts a verse counter on itself in its controller's upkeep if they choose", () => {
    const { game, a } = table();
    const dirge = spawn(game, "Discordant Dirge");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, dirge, "verse")).toBe(1);
  });
});

describe("Clairvoyance", () => {
  it("looks now and draws at the next upkeep", () => {
    const { game, a } = table();
    let looked = false;
    a.chooseFromZoneFn = () => {
      looked = true;
      return [];
    };
    lands(game, "Island", 1);
    cast(game, toHand(game, "Clairvoyance"), { targets: [ref(B)] });
    expect(looked).toBe(true);
    const before = hand(game, A).length;
    nextTurn(game); // Bob's turn: the delayed draw is Alice's, at that upkeep
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Lay Bare: counter target spell, look at its controller's hand", () => {
  /** On his own turn Bob casts a Llanowar Elves, and Alice gets priority
   * with it on the stack. */
  const bobCastsBears = (game: ReturnType<typeof table>["game"]): ObjectId => {
    lands(game, "Forest", 1, B);
    const elves = toHand(game, "Llanowar Elves", B);
    game.advanceUntil((s) => s.priority.holder === B || s.result.over);
    game.dispatch({ type: "cast-spell", player: B, card: elves, targets: [] });
    game.advanceUntil((s) => (s.priority.holder === A && s.zones.shared.stack.length > 0) || s.result.over);
    return elves;
  };

  it("counters the spell, then Alice looks at its controller's hand alone", () => {
    const { game, a } = table({ players: 3 });
    nextTurn(game); // Bob's turn: he casts a creature at sorcery speed
    const bears = bobCastsBears(game);
    const bobsHand = [...hand(game, B)];
    let looked: { view: PlayerView; eligible: readonly ObjectId[] } | undefined;
    let carolSaw: PlayerView | undefined;
    a.chooseFromZoneFn = (_view, eligible) => {
      looked = { view: game.viewFor(A), eligible };
      carolSaw = game.viewFor(C);
      return [];
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Lay Bare"), { targets: [{ kind: "object", object: bears }] });
    expect(graveyard(game, B)).toContain(bears);
    expect(looked).toBeDefined();
    expect(looked!.eligible).toEqual([]);
    for (const id of bobsHand) expect(looked!.view.objects[id]?.cardName).toBe(game.state.objects[id].cardName);
    for (const id of bobsHand) expect(carolSaw!.objects[id]).toBeUndefined();
    expect(hand(game, B)).toEqual(bobsHand);
  });

  it("with its target gone, it doesn't resolve and looks at nothing", () => {
    const { game, a } = table();
    nextTurn(game);
    const bears = bobCastsBears(game);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Lay Bare"), { targets: [{ kind: "object", object: bears }], settle: false });
    // Bob's spell resolves first: Alice's Lay Bare's only target is gone.
    game.debugApplyEffect(A, { kind: "counter", target: 0 }, [{ kind: "object", object: bears }]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 || s.result.over);
    expect(asked).toBe(0);
  });
});
