/**
 * Impulse permissions whose window is a predicate: during your next turn alone,
 * during a turn you attacked with the source or put a lore counter on it, until
 * end of combat on your next turn, until the source exiles another card, for as
 * long as you control the source — and an `exile` that grants one for any of
 * those durations, lands included.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  cast,
  destroy,
  enter,
  lands,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
  pickTargets,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

/** On `turn`, in `step`, with `player` holding priority. */
const at = (game: Game, turn: number, step: GameState["turn"]["step"], player: PlayerId = A): void =>
  game.advanceUntil((s) => s.turn.number === turn && s.turn.step === step && s.priority.holder === player);

const playable = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

const reachable = (game: Game): ObjectId => toLibrary(game, "Lightning Bolt");

describe('"during your next turn" (Galvanic Relay)', () => {
  it("is that turn alone: not this one, not another player's, not the one after", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bolt = reachable(game);
    cast(game, toHand(game, "Galvanic Relay"));
    expect(zone(game, bolt)).toBe("exile");
    expect(playable(game, bolt)).toBe(false);
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(false);
    at(game, 3, "precombat-main");
    expect(playable(game, bolt)).toBe(true);
    at(game, 4, "upkeep");
    expect(playable(game, bolt)).toBe(false);
    at(game, 5, "precombat-main");
    expect(playable(game, bolt)).toBe(false);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("gives a storm copy a card of its own", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const first = reachable(game);
    const second = reachable(game);
    cast(game, toHand(game, "Galvanic Relay"));
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    at(game, 3, "precombat-main");
    expect(playable(game, first)).toBe(true);
    expect(playable(game, second)).toBe(true);
  });
});

describe('"during any turn you attacked with this creature" (Goblin Researcher)', () => {
  const researched = (game: Game): { goblin: ObjectId; bolt: ObjectId } => {
    lands(game, "Mountain", 1);
    const bolt = reachable(game);
    return { goblin: enter(game, "Goblin Researcher"), bolt };
  };

  it("is only a turn it attacked, before and after the attack", () => {
    const { game, a } = table();
    const { goblin, bolt } = researched(game);
    expect(playable(game, bolt)).toBe(false);
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    at(game, 1, "postcombat-main");
    expect(playable(game, bolt)).toBe(true);
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(false);
    a.declareAttackersFn = () => [];
    at(game, 3, "postcombat-main");
    expect(playable(game, bolt)).toBe(false);
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    at(game, 5, "postcombat-main");
    expect(playable(game, bolt)).toBe(true);
  });

  it("holds once it has left, for the turn it attacked (the ruling)", () => {
    const { game, a } = table();
    const { goblin, bolt } = researched(game);
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    at(game, 1, "postcombat-main");
    destroy(game, goblin);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(playable(game, bolt)).toBe(true);
    at(game, 3, "precombat-main");
    expect(playable(game, bolt)).toBe(false);
  });

  it("doesn't count another Researcher, or the same card back as a new object", () => {
    const { game, a } = table();
    const { goblin, bolt } = researched(game);
    const other = spawn(game, "Goblin Researcher");
    a.declareAttackersFn = () => [{ attacker: other, defender: B }];
    at(game, 1, "postcombat-main");
    expect(playable(game, bolt)).toBe(false);
    game.debugMove(goblin, "exile");
    game.debugMove(goblin, "battlefield");
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    at(game, 3, "postcombat-main");
    expect(playable(game, bolt)).toBe(false);
  });

  it("doesn't count an attack by another player who took it", () => {
    const { game, b } = table();
    const { goblin, bolt } = researched(game);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(goblin)]);
    b.declareAttackersFn = () => [{ attacker: goblin, defender: A }];
    at(game, 2, "end");
    expect(playable(game, bolt)).toBe(false);
  });
});

describe('"during any turn you put a lore counter on this Saga"', () => {
  it("is each such turn, its last too, and none after", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const saga = spawn(game, "History of Benalia");
    const bolt = reachable(game);
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "while-exiled", play: true, sourceDid: "lore-counter" }, [], {
      source: saga,
    });
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(false);
    at(game, 3, "postcombat-main");
    expect(playable(game, bolt)).toBe(true);
    at(game, 4, "upkeep");
    expect(playable(game, bolt)).toBe(false);
    at(game, 5, "postcombat-main");
    // Sacrificed after its last chapter; the turn still counts.
    expect(zone(game, saga)).toBe("graveyard");
    expect(playable(game, bolt)).toBe(true);
    at(game, 7, "postcombat-main");
    expect(playable(game, bolt)).toBe(false);
  });
});

describe('"until end of combat on your next turn" (Brazen Cannonade)', () => {
  it("runs through other turns and your next precombat, and ends with that combat", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Brazen Cannonade");
    const bears = spawn(game, "Grizzly Bears");
    const bolt = reachable(game);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    at(game, 1, "postcombat-main");
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(playable(game, bolt)).toBe(true);
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(true);
    a.declareAttackersFn = () => [];
    at(game, 3, "precombat-main");
    expect(playable(game, bolt)).toBe(true);
    at(game, 3, "postcombat-main");
    expect(playable(game, bolt)).toBe(false);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("gives nothing without an attack", () => {
    const { game } = table();
    spawn(game, "Brazen Cannonade");
    const bolt = reachable(game);
    at(game, 1, "end");
    expect(zone(game, bolt)).toBe("library");
  });
});

describe('"until you exile another card with this" (Furious Rise)', () => {
  it("ends only when the same source exiles another, even once it has left", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Craw Wurm");
    const rise = spawn(game, "Furious Rise");
    const first = reachable(game);
    at(game, 2, "upkeep");
    expect(zone(game, first)).toBe("exile");
    expect(playable(game, first)).toBe(true);

    const second = reachable(game);
    // Alice's draw for turn 3 takes `second` unless it's buried: one on top.
    const drawn = toLibrary(game, "Wastes");
    at(game, 4, "upkeep");
    expect(zone(game, drawn)).toBe("hand");
    expect(zone(game, second)).toBe("exile");
    expect(playable(game, first)).toBe(false);
    expect(playable(game, second)).toBe(true);

    destroy(game, rise);
    at(game, 5, "precombat-main");
    expect(playable(game, second)).toBe(true);
    at(game, 7, "precombat-main");
    expect(playable(game, second)).toBe(true);
  });

  it("a second copy's exile doesn't touch the first's card", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Craw Wurm");
    const one = spawn(game, "Furious Rise");
    const first = reachable(game);
    at(game, 2, "upkeep");
    expect(zone(game, first)).toBe("exile");
    const other = spawn(game, "Furious Rise");
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "until-next-exile", play: true }, [], { source: other });
    expect(playable(game, first)).toBe(true);
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "until-next-exile", play: true }, [], { source: one });
    expect(playable(game, first)).toBe(false);
  });
});

describe('"for as long as you control this" (Lightning, Victor Mancha)', () => {
  const grantedBy = (game: Game): { source: ObjectId; bolt: ObjectId } => {
    lands(game, "Mountain", 1);
    const source = spawn(game, "Lightning, Security Sergeant");
    const bolt = reachable(game);
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "while-you-control-source", play: true }, [], { source });
    return { source, bolt };
  };

  it("is exiled on combat damage, with the permission", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const source = spawn(game, "Lightning, Security Sergeant");
    const bolt = reachable(game);
    a.declareAttackersFn = () => [{ attacker: source, defender: B }];
    at(game, 1, "postcombat-main");
    expect(zone(game, bolt)).toBe("exile");
    expect(playable(game, bolt)).toBe(true);
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(true);
  });

  it("is over for good once you lose control, even taking it back (the ruling)", () => {
    const { game } = table();
    const { source, bolt } = grantedBy(game);
    expect(playable(game, bolt)).toBe(true);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(source)]);
    at(game, 1, "postcombat-main");
    expect(playable(game, bolt)).toBe(false);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(source)]);
    at(game, 1, "end");
    expect(game.state.objects[source].controller).toBe(A);
    expect(playable(game, bolt)).toBe(false);
  });

  it("is over once it leaves, a return being a new object (rule 400.7)", () => {
    const { game } = table();
    const { source, bolt } = grantedBy(game);
    game.debugMove(source, "exile");
    game.debugMove(source, "battlefield");
    expect(playable(game, bolt)).toBe(false);
  });

  it("reaches an `exile`: Victor Mancha plays the target, a land too", () => {
    const { game, a } = table();
    const land = toGraveyard(game, "Mountain");
    pickTargets(a, land);
    const victor = enter(game, "Victor Mancha, Runaway");
    expect(zone(game, land)).toBe("exile");
    expect(playable(game, land)).toBe(true);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(victor)]);
    at(game, 1, "postcombat-main");
    expect(playable(game, land)).toBe(false);
  });
});

describe("an exile with a play permission for a duration", () => {
  it("Scholar of Combustion: casting only, until the end of your next turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    enter(game, "Scholar of Combustion");
    expect(zone(game, bolt)).toBe("exile");
    expect(playable(game, bolt)).toBe(true);
    at(game, 2, "upkeep");
    expect(playable(game, bolt)).toBe(true);
    at(game, 3, "postcombat-main");
    expect(playable(game, bolt)).toBe(true);
    at(game, 5, "precombat-main");
    expect(playable(game, bolt)).toBe(false);
  });

  it("Containment Construct: a discarded land may be played this turn, and not after", () => {
    const { game, a } = table();
    spawn(game, "Containment Construct");
    const land = toHand(game, "Mountain");
    a.chooseModesFn = () => [0];
    a.chooseDiscardsFn = () => [land];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, land)).toBe("exile");
    expect(playable(game, land)).toBe(true);
    at(game, 3, "precombat-main");
    expect(playable(game, land)).toBe(false);
  });
});
