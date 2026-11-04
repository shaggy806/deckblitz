/**
 * "N mana in any combination of colors" is the player's split, every way it's
 * made: a live X past what a list can hold (Selvala, Heart of the Wilds), a
 * printed number past it (Cascading Cataracts), and a triggered mana ability
 * adding more than one (Market Festival). Beside it, Selvala's draw, read
 * strictly against every other creature as it resolves.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, enter, hand, lands, settle, spawn, table, toHand, zone } from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const pool = (game: Game, player: PlayerId = A) => poolCounts(game.state.players[player].manaPool);
const offers = (game: Game, source: ObjectId, index = 0): ActivateOffer[] =>
  game
    .legalActions(A)
    .filter((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);
const tapFor = (game: Game, source: ObjectId, index: number, manaColors: readonly string[]): void => {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [], manaColors } as never);
};

describe("Selvala, Heart of the Wilds: the mana", () => {
  it("makes X, the greatest power among your own creatures, split as the player picks", () => {
    const { game } = table();
    const selvala = spawn(game, "Selvala, Heart of the Wilds");
    // Colossal Dreadmaw is a 6/6: X is 6, the opponent's bigger creature no matter.
    spawn(game, "Colossal Dreadmaw");
    spawn(game, "Colossal Dreadmaw", B);
    game.state.objects[spawn(game, "Colossal Dreadmaw", B)].counters = { "+1/+1": 3 };
    lands(game, "Forest", 1);

    const options = offers(game, selvala);
    // Six units over five colours is past the list's budget: all of one colour
    // each, and one offer whose split the player picks.
    expect(options).toHaveLength(6);
    expect(options.find((o) => o.manaSplit !== undefined)?.manaSplit).toEqual({
      colors: ["W", "U", "B", "R", "G"],
      amount: 6,
    });

    tapFor(game, selvala, 0, ["W", "W", "U", "B", "R", "G"]);
    settle(game);
    expect(pool(game)).toMatchObject({ W: 2, U: 1, B: 1, R: 1, G: 1 });
    expect(game.state.objects[selvala].tapped).toBe(true);
  });

  it("lists every split while the list stays small", () => {
    const { game } = table();
    const selvala = spawn(game, "Selvala, Heart of the Wilds");
    lands(game, "Forest", 1);
    // Her own power, 2: fifteen splits of two over five colours.
    const options = offers(game, selvala);
    expect(options).toHaveLength(15);
    expect(options.every((o) => o.manaSplit === undefined)).toBe(true);
    expect(options.map((o) => o.manaColors)).toContainEqual(["W", "G"]);
  });

  it("makes nothing at a greatest power of 0 or less (the ruling)", () => {
    const { game } = table();
    const selvala = spawn(game, "Selvala, Heart of the Wilds");
    game.state.objects[selvala].counters = { "-1/-1": 2 };
    lands(game, "Forest", 1);
    activate(game, selvala, 0);
    expect(game.state.objects[selvala].tapped).toBe(true);
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });
});

describe("Selvala, Heart of the Wilds: the draw", () => {
  const answering = (t: ReturnType<typeof table>, yes: boolean): PlayerId[] => {
    const asked: PlayerId[] = [];
    for (const seat of [t.a, t.b]) {
      seat.chooseModesFn = () => {
        asked.push(seat.playerId);
        return yes ? [0] : [];
      };
    }
    return asked;
  };

  it("offers the new creature's controller the draw when it's the biggest, whoever controls Selvala", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Selvala, Heart of the Wilds");
    const asked = answering(t, true);
    const before = { a: hand(game, A).length, b: hand(game, B).length };
    enter(game, "Hill Giant", B);
    expect(asked).toEqual([B]);
    expect(hand(game, B).length).toBe(before.b + 1);
    expect(hand(game, A).length).toBe(before.a);
  });

  it("draws nothing on a no", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Selvala, Heart of the Wilds");
    const asked = answering(t, false);
    const before = hand(game, A).length;
    enter(game, "Hill Giant", A);
    expect(asked).toEqual([A]);
    expect(hand(game, A).length).toBe(before);
  });

  it("asks nobody on a tie or anything smaller", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Selvala, Heart of the Wilds");
    spawn(game, "Hill Giant", B);
    const asked = answering(t, true);
    // Hill Giant is a 3/3: an equal power doesn't count, nor does a lesser one.
    enter(game, "Hill Giant", A);
    enter(game, "Grizzly Bears", A);
    expect(asked).toEqual([]);
  });

  it("isn't set off by Selvala herself", () => {
    const t = table();
    const { game } = t;
    const asked = answering(t, true);
    enter(game, "Selvala, Heart of the Wilds", A);
    expect(asked).toEqual([]);
  });

  it("compares as it resolves, the creature as it last existed if it has left (the rulings)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Selvala, Heart of the Wilds");
    const asked = answering(t, true);
    const giant = enter(game, "Hill Giant", B, { settle: false });
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: giant }]);
    expect(zone(game, giant)).toBe("graveyard");
    settle(game);
    expect(asked).toEqual([B]);

    // Bigger when it entered, not as it resolves: nobody's asked.
    asked.length = 0;
    const second = enter(game, "Hill Giant", B, { settle: false });
    spawn(game, "Colossal Dreadmaw", B);
    settle(game);
    expect(zone(game, second)).toBe("battlefield");
    expect(asked).toEqual([]);
  });
});

describe("Cascading Cataracts", () => {
  it("offers all of one colour each and a split of the five, for {5}", () => {
    const { game } = table();
    const cataracts = spawn(game, "Cascading Cataracts");
    lands(game, "Wastes", 5);
    const options = offers(game, cataracts, 1);
    expect(options).toHaveLength(6);
    expect(options.find((o) => o.manaSplit !== undefined)?.manaSplit).toEqual({
      colors: ["W", "U", "B", "R", "G"],
      amount: 5,
    });
    tapFor(game, cataracts, 1, ["W", "U", "B", "R", "R"]);
    settle(game);
    expect(pool(game)).toMatchObject({ W: 1, U: 1, B: 1, R: 2, G: 0, C: 0 });
  });

  it("makes {C} for nothing, and survives a destroy effect", () => {
    const { game } = table();
    const cataracts = spawn(game, "Cascading Cataracts");
    activate(game, cataracts, 0);
    expect(pool(game)).toMatchObject({ C: 1 });
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: cataracts }]);
    expect(zone(game, cataracts)).toBe("battlefield");
  });

  it("pays five colours for the auto-payer", () => {
    const { game } = table();
    spawn(game, "Cascading Cataracts");
    lands(game, "Wastes", 5);
    const atogatog = toHand(game, "Atogatog");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === atogatog)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card: atogatog, targets: [] });
    settle(game);
    expect(zone(game, atogatog)).toBe("battlefield");
  });
});

describe("Market Festival", () => {
  const festive = () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    const festival = game.debugSpawn("Market Festival", A, "battlefield");
    game.state.objects[festival].attachedTo = forest;
    return { game, forest };
  };

  it("adds two mana, each unit its own pick, with an offer per combination", () => {
    const { game, forest } = festive();
    const options = offers(game, forest);
    // Fifteen combinations of two over five colours, {U}{W} not again after {W}{U}.
    expect(options).toHaveLength(15);
    const sets = options.map((o) => [...(o.manaColors ?? [])].sort().join(""));
    expect(new Set(sets).size).toBe(15);
    tapFor(game, forest, 0, ["W", "R"]);
    settle(game);
    expect(pool(game)).toMatchObject({ G: 1, W: 1, R: 1 });
  });

  it("can make both of one colour", () => {
    const { game, forest } = festive();
    tapFor(game, forest, 0, ["U", "U"]);
    settle(game);
    expect(pool(game)).toMatchObject({ G: 1, U: 2 });
  });

  it("pays two different colours for the auto-payer", () => {
    const { game } = festive();
    // {G}{W}{U}: one land, its {G} and the Festival's two others.
    const monk = toHand(game, "Rhox War Monk");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === monk)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card: monk, targets: [] });
    settle(game);
    expect(zone(game, monk)).toBe("battlefield");
  });

  it("gives its mana to the land's controller, not the Aura's", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    const festival = game.debugSpawn("Market Festival", B, "battlefield");
    game.state.objects[festival].attachedTo = forest;
    tapFor(game, forest, 0, ["B", "R"]);
    expect(pool(game)).toMatchObject({ G: 1, B: 1, R: 1 });
    expect(pool(game, B)).toMatchObject({ G: 0, B: 0, R: 0 });
  });
});
