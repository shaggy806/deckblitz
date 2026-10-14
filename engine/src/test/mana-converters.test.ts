/**
 * "Converter" mana sources — a mana ability whose own activation cost is
 * generic mana (a Signet's "{1}, {T}: Add {B}{R}").
 *
 * These were excluded from `manaSources()` outright until now, to keep the
 * payment planner from having to plan circularly. They're admitted on three
 * conditions, all enforced in `manaSources`: the activation cost is purely
 * generic (a coloured one really would need the colour to make the colour),
 * it produces more than it costs, and the planner only reaches for one once
 * the ordinary sources are spent — funding it from those, never from another
 * converter.
 */

import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import { poolCounts } from "../mana.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const makeGame = () =>
  Game.create({
    seed: 1,
    shuffle: false,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    decks: [
      { player: A, cards: Array<string>(40).fill("Plains") },
      { player: B, cards: Array<string>(40).fill("Plains") },
    ],
  });

/** Untapped lands of one basic type for A. */
const lands = (game: Game, kind: string, n: number) => {
  for (let i = 0; i < n; i += 1) {
    const id = game.debugSpawn(kind, A, "battlefield");
    game.state.objects[id].tapped = false;
  }
};

const open = (game: Game) =>
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");

const canCast = (game: Game, card: string): boolean => {
  const id = game.debugSpawn(card, A, "hand");
  return game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === id);
};

describe("a Signet as a mana source", () => {
  it("fixes colour: Plains plus a Signet casts a {B}{R} spell", () => {
    const game = makeGame();
    open(game);
    // Plains make neither colour, so without the Signet it's uncastable.
    lands(game, "Plains", 2);
    expect(canCast(game, "Stormfist Crusader")).toBe(false);

    const fresh = makeGame();
    open(fresh);
    lands(fresh, "Plains", 1);
    const signet = fresh.debugSpawn("Rakdos Signet", A, "battlefield");
    fresh.state.objects[signet].tapped = false;
    // {B}{R}: the Plains funds the Signet, which makes one of each.
    expect(canCast(fresh, "Stormfist Crusader")).toBe(true);
  });

  it("makes exactly {B}{R} — never two of one colour", () => {
    // "Add {B}{R}" is one black and one red, so a {B}{B} spell is out of
    // reach however much else there is to fund the Signet.
    const game = makeGame();
    open(game);
    lands(game, "Plains", 3);
    const signet = game.debugSpawn("Rakdos Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;
    expect(canCast(game, "Sign in Blood")).toBe(false);

    // By hand, too: activating it floats one of each.
    const hand = makeGame();
    open(hand);
    lands(hand, "Plains", 1);
    const floating = hand.debugSpawn("Rakdos Signet", A, "battlefield");
    hand.state.objects[floating].tapped = false;
    hand.dispatch({ type: "activate-ability", player: A, source: floating, abilityIndex: 0, targets: [] });
    const pool = poolCounts(hand.state.players[A].manaPool);
    expect(pool.B).toBe(1);
    expect(pool.R).toBe(1);
  });

  it("actually taps both, and pays the Signet's own {1} from the pool", () => {
    const game = makeGame();
    open(game);
    lands(game, "Plains", 3);
    const signet = game.debugSpawn("Rakdos Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;

    const card = game.debugSpawn("Stormfist Crusader", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });

    expect(game.state.objects[signet].tapped).toBe(true);
    const tappedLands = game.state.zones.shared.battlefield.filter(
      (id) =>
        game.state.objects[id].controller === A &&
        game.state.objects[id].tapped &&
        game.characteristics(id).types.includes("land"),
    );
    // One Plains funded the Signet's {1}; the Signet's {B}{R} paid the spell.
    expect(tappedLands.length).toBe(1);
  });

  it("is not reached while ordinary sources can pay", () => {
    const game = makeGame();
    open(game);
    lands(game, "Swamp", 4);
    const signet = game.debugSpawn("Rakdos Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;

    const card = game.debugSpawn("Sign in Blood", A, "hand");
    game.dispatch({
      type: "cast-spell",
      player: A,
      card,
      targets: [{ kind: "player", player: A }],
    });
    // Two Swamps cover {B}{B} on their own, so the Signet stays up.
    expect(game.state.objects[signet].tapped).toBe(false);
  });

  it("can't fund itself off an empty board", () => {
    const game = makeGame();
    open(game);
    const signet = game.debugSpawn("Rakdos Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;
    // The Signet makes two mana but needs one first, and there's nothing
    // else — so nothing is castable and it is never tapped.
    expect(canCast(game, "Sign in Blood")).toBe(false);
    expect(game.state.objects[signet].tapped).toBe(false);
  });

  it("won't fund one Signet with another", () => {
    const game = makeGame();
    open(game);
    const one = game.debugSpawn("Rakdos Signet", A, "battlefield");
    const two = game.debugSpawn("Dimir Signet", A, "battlefield");
    game.state.objects[one].tapped = false;
    game.state.objects[two].tapped = false;
    expect(canCast(game, "Sign in Blood")).toBe(false);
  });

  it("only supplies the colours it actually makes", () => {
    const game = makeGame();
    open(game);
    lands(game, "Island", 3);
    const signet = game.debugSpawn("Azorius Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;
    // An Azorius Signet makes {W} and {U}. Sign in Blood wants {B}{B}, and
    // there's no black on the board at all.
    expect(canCast(game, "Sign in Blood")).toBe(false);
  });

  it("funds itself off a land whose colour the cost doesn't want", () => {
    const game = makeGame();
    open(game);
    for (const kind of ["Island", "Island", "Swamp", "Swamp"]) {
      const id = game.debugSpawn(kind, A, "battlefield");
      game.state.objects[id].tapped = false;
    }
    const signet = game.debugSpawn("Azorius Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;

    // Cloudblazer is {3}{W}{U}. Four lands plus a net +1 from the Signet is
    // exactly five mana, and the only {W} on the board is the Signet's — so
    // the {1} has to come from a Swamp. Funding it from an Island instead
    // would strand the {U} and the whole plan would fail.
    const card = game.debugSpawn("Cloudblazer", A, "hand");
    expect(
      game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card),
    ).toBe(true);

    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    const untapped = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].controller === A && !game.state.objects[id].tapped,
    );
    // Everything was needed, so nothing is left standing.
    expect(untapped.length).toBe(0);
  });

  it("spends the exact unit it was funded with, not 'one generic'", () => {
    // The fuzzer's repro for this: the plan promised the cost's colours, then
    // the Signet's own payment ate one of them out of the pool and the final
    // deduction underflowed. A converter now records the specific mana each
    // funding source gave it and spends that back verbatim.
    const game = makeGame();
    open(game);
    for (const kind of ["Island", "Island", "Swamp", "Swamp"]) {
      const id = game.debugSpawn(kind, A, "battlefield");
      game.state.objects[id].tapped = false;
    }
    const signet = game.debugSpawn("Azorius Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;

    const card = game.debugSpawn("Cloudblazer", A, "hand");
    expect(() =>
      game.dispatch({ type: "cast-spell", player: A, card, targets: [] }),
    ).not.toThrow();

    // Nothing floating: five mana produced, five spent.
    const pool = poolCounts(game.state.players[A].manaPool);
    expect(Object.values(pool).reduce((n, v) => n + (v ?? 0), 0)).toBe(0);
  });

  it("still counts when the lands alone would pay everything but its last mana", () => {
    // Two lands and a Signet are three mana: one land funds the Signet, which
    // makes two. A greedy planner that spends both lands on the cost first has
    // nothing left to fund the Signet with, so the spell looked uncastable �
    // and a player skipping mana-only windows was passed out of their main
    // phase holding a castable spell.
    const game = makeGame();
    open(game);
    lands(game, "Island", 2);
    const signet = game.debugSpawn("Izzet Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;
    expect(canCast(game, "Worn Powerstone")).toBe(true);
    expect(canCast(game, "Aether Channeler")).toBe(true);
    expect(game.isDeadForMana(A)).toBe(false);

    const card = game.debugSpawn("Worn Powerstone", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    const untapped = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].controller === A && !game.state.objects[id].tapped,
    );
    expect(untapped.length).toBe(0);
  });

  it("but two lands and a Signet are still only three mana", () => {
    const game = makeGame();
    open(game);
    lands(game, "Island", 2);
    const signet = game.debugSpawn("Izzet Signet", A, "battlefield");
    game.state.objects[signet].tapped = false;
    expect(canCast(game, "Gilded Lotus")).toBe(false);
  });
});

/** Untapped permanents for A, by name. */
const spawn = (game: Game, names: readonly string[]): ObjectId[] =>
  names.map((name) => {
    const id = game.debugSpawn(name, A, "battlefield", { summoningSick: false });
    game.state.objects[id].tapped = false;
    return id;
  });

describe("a filter land's hybrid activation cost", () => {
  // A bug report (2026-10-10): Ureni of the Unwritten ({4}{G}{U}{R}) was paid
  // by sacrificing a Treasure for its {U} beside a Flooded Grove, whose
  // `{G/U}, {T}: Add {G}{G}, {G}{U}, or {U}{U}` the auto-payer left out, so
  // the Treasure was the only blue it saw. A Forest funds the Grove.
  const board = [
    "Flooded Grove",
    "Forest",
    "Forest",
    "Mountain",
    "Mountain",
    "Temple of Abandon",
    "Rockfall Vale",
    "Treasure Token",
  ];

  it("funds Flooded Grove from a Forest rather than sacrificing a Treasure for blue", () => {
    const game = makeGame();
    open(game);
    const [grove, , , , , , , treasure] = spawn(game, board);
    const card = game.debugSpawn("Ureni of the Unwritten", A, "hand");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    expect(game.state.zones.shared.battlefield).toContain(treasure);
    expect(game.state.objects[grove].tapped).toBe(true);
    expect(game.state.zones.shared.stack).toContain(card);
  });

  it("is not reached while an ordinary source makes the colour", () => {
    const game = makeGame();
    open(game);
    const [grove, , , , , , , treasure] = spawn(game, [...board, "Island"]);
    const card = game.debugSpawn("Ureni of the Unwritten", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    expect(game.state.zones.shared.battlefield).toContain(treasure);
    // The Island pays the {U}; the Grove is just a land among the {4}.
    expect(game.state.zones.shared.stack).toContain(card);
    expect(game.state.players[A].manaPool).toEqual([]);
    void grove;
  });
});

describe("floating mana funds a converter", () => {
  // A bug report (2026-10-10): with {R} floating from a Mountain tapped by
  // hand, Mossfire Valley's `{1}, {T}: Add {R}{G}` could take that {R} and
  // pay Rampant Growth's {1}{G} � but the planner funded a converter only from
  // other sources, so the spell wasn't offered, the window counted as mana
  // only, and the server passed it.
  it("casts Rampant Growth with {R} floating and Mossfire Valley untapped", () => {
    const game = makeGame();
    open(game);
    const [valley] = spawn(game, ["Mossfire Valley"]);
    game.state.players[A].manaPool = [{ type: "R" }];
    const card = game.debugSpawn("Rampant Growth", A, "hand");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card)).toBe(true);
    expect(game.isDeadForMana(A)).toBe(false);
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    expect(game.state.zones.shared.stack).toContain(card);
    expect(game.state.objects[valley].tapped).toBe(true);
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("casts a {2}{G} spell with {G}{G} floating and Mossfire Valley untapped", () => {
    // The second report: Frontier Siege's {G}{G} floating in the second main.
    const game = makeGame();
    open(game);
    spawn(game, ["Mossfire Valley"]);
    game.state.players[A].manaPool = [{ type: "G" }, { type: "G" }];
    const card = game.debugSpawn("Garruk's Uprising", A, "hand");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    expect(game.state.zones.shared.stack).toContain(card);
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("funds a converter only with mana an ability's cost may spend", () => {
    // Fuzzer seed 27 (2026-10-11): with a creature-only {W}, a {C} and a {U}
    // floating, casting a creature spell funded Skycloud Expanse's {1} with
    // the creature-only {W} — mana kept for a kind of spell can't pay an
    // ability's cost — and the payment threw. The {C} funds it instead.
    const game = makeGame();
    open(game);
    const [expanse] = spawn(game, ["Skycloud Expanse"]);
    game.state.players[A].manaPool = [
      { type: "W", restriction: { spell: { type: "creature" }, text: "Spend this mana only to cast a creature spell." } },
      { type: "C" },
      { type: "U" },
    ];
    const card = game.debugSpawn("Archaeomancer", A, "hand");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    expect(game.state.zones.shared.stack).toContain(card);
    expect(game.state.objects[expanse].tapped).toBe(true);
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("still can't make what isn't there: {R} floating funds the Valley, not a third mana", () => {
    const game = makeGame();
    open(game);
    spawn(game, ["Mossfire Valley"]);
    game.state.players[A].manaPool = [{ type: "R" }];
    // {R} floating plus the Valley is two mana ({R} spent on the Valley, then
    // {R}{G}): a three-mana spell stays out of reach.
    expect(canCast(game, "Garruk's Uprising")).toBe(false);
  });
});

describe("a Shadowmoor filter land beside its free {C}", () => {
  // A bug report (2026-10-13): the filter lands' `{W/U}, {T}: Add {W}{W},
  // {W}{U}, or {U}{U}` didn't work with the auto-payer. Mystic Gate's free
  // `{T}: Add {C}` made it no converter, so nothing funded it first, and a
  // gate whose paid option couldn't be funded was given up on whole.
  const cast = (game: Game, card: string): ObjectId => {
    const id = game.debugSpawn(card, A, "hand");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === id), card).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card: id, targets: [] });
    expect(game.state.zones.shared.stack).toContain(id);
    return id;
  };

  it("falls back on its {C} when the paid option can't be funded: Think Twice off it and an Island", () => {
    const game = makeGame();
    open(game);
    const [gate, island] = spawn(game, ["Mystic Gate", "Island"]);
    cast(game, "Think Twice");
    expect(game.state.objects[gate].tapped).toBe(true);
    expect(game.state.objects[island].tapped).toBe(true);
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("is funded first by the land whose colour it makes: Glorious Anthem off it, a Plains and a Swamp", () => {
    // The Plains pays {W/U} and the gate makes {W}{W}; the Swamp pays the {1}.
    // Spending the Plains on a {W} first leaves the gate unfunded.
    const game = makeGame();
    open(game);
    const lands = spawn(game, ["Mystic Gate", "Plains", "Swamp"]);
    cast(game, "Glorious Anthem");
    for (const id of lands) expect(game.state.objects[id].tapped).toBe(true);
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("funds two gates from two Islands: Wrath of God", () => {
    const game = makeGame();
    open(game);
    const lands = spawn(game, ["Mystic Gate", "Mystic Gate", "Island", "Island"]);
    cast(game, "Wrath of God");
    for (const id of lands) expect(game.state.objects[id].tapped).toBe(true);
  });

  it("funds one gate with another's mana: two gates and a Plains are {W}{W}{W}", () => {
    // The Plains funds the first gate; one of its {W}{W}, already counted
    // toward the spell, funds the second, whose {W}{W} stand in for it.
    const game = makeGame();
    open(game);
    const lands = spawn(game, ["Mystic Gate", "Mystic Gate", "Plains"]);
    cast(game, "Healer's Flock");
    for (const id of lands) expect(game.state.objects[id].tapped).toBe(true);
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("still can't make what isn't there", () => {
    const game = makeGame();
    open(game);
    // An Island funds the gate, and that's two mana for a three-mana spell.
    spawn(game, ["Mystic Gate", "Island"]);
    expect(canCast(game, "Glorious Anthem")).toBe(false);
    // Colourless can't pay {W/U}, and the gate's own {C} isn't blue.
    const other = makeGame();
    open(other);
    spawn(other, ["Mystic Gate", "Sol Ring"]);
    expect(canCast(other, "Opt")).toBe(false);
    // Nor can the gate fund itself.
    const alone = makeGame();
    open(alone);
    spawn(alone, ["Mystic Gate", "Mystic Gate"]);
    expect(canCast(alone, "Opt")).toBe(false);
  });
});

describe("a converter that only fixes a colour, or costs a coloured pip", () => {
  // The user (2026-10-13): Prismatic Lens's "{1}, {T}: Add one mana of any
  // color" made no more than it cost, and Ceta Disciple's "{G}, {T}: Add one
  // mana of any color" cost a coloured pip, so the auto-payer used neither.
  const cast = (game: Game, card: string): void => {
    const id = game.debugSpawn(card, A, "hand");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === id), card).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card: id, targets: [] });
    expect(game.state.zones.shared.stack).toContain(id);
    expect(game.state.players[A].manaPool).toEqual([]);
  };
  const tapped = (game: Game, ids: readonly ObjectId[]): boolean[] => ids.map((id) => game.state.objects[id].tapped);

  it("turns a Swamp blue through Prismatic Lens, and two for one through Celestial Prism", () => {
    const game = makeGame();
    open(game);
    const lens = spawn(game, ["Prismatic Lens", "Swamp"]);
    cast(game, "Opt");
    expect(tapped(game, lens)).toEqual([true, true]);

    const prism = makeGame();
    open(prism);
    spawn(prism, ["Celestial Prism", "Swamp"]);
    expect(canCast(prism, "Opt")).toBe(false);
    spawn(prism, ["Swamp"]);
    expect(canCast(prism, "Opt")).toBe(true);
  });

  it("taps a land that makes the colour before converting one that doesn't", () => {
    const game = makeGame();
    open(game);
    const [lens, island, swamp] = spawn(game, ["Prismatic Lens", "Island", "Swamp"]);
    cast(game, "Opt");
    expect(tapped(game, [lens, island, swamp])).toEqual([false, true, false]);
    // And its free {C} pays generic like any land: {2}{U} off all three.
    const more = makeGame();
    open(more);
    const all = spawn(more, ["Prismatic Lens", "Island", "Swamp"]);
    cast(more, "Divination");
    expect(tapped(more, all)).toEqual([true, true, true]);
  });

  it("pays a coloured activation cost from another source: Ceta Disciple, Agent of Stromgald, Apprentice Wizard", () => {
    const disciple = makeGame();
    open(disciple);
    const ceta = spawn(disciple, ["Ceta Disciple", "Forest"]);
    cast(disciple, "Opt");
    expect(tapped(disciple, ceta)).toEqual([true, true]);

    // "{R}: Add {B}" — no {T}, once per payment.
    const agent = makeGame();
    open(agent);
    spawn(agent, ["Agent of Stromgald", "Mountain"]);
    cast(agent, "Dark Ritual");

    // "{U}, {T}: Add {C}{C}{C}": two Islands are four mana.
    const wizard = makeGame();
    open(wizard);
    spawn(wizard, ["Apprentice Wizard", "Island"]);
    expect(canCast(wizard, "Hedron Archive")).toBe(false);
    spawn(wizard, ["Island"]);
    expect(canCast(wizard, "Hedron Archive")).toBe(true);
  });

  it("offers an untapped one once a payment: Llanowar Envoy's {1}{G} wants two Forests", () => {
    const game = makeGame();
    open(game);
    spawn(game, ["Llanowar Envoy", "Forest"]);
    expect(canCast(game, "Opt")).toBe(false);
    spawn(game, ["Forest"]);
    expect(canCast(game, "Opt")).toBe(true);
  });

  it("never sacrifices a creature or swaps one mana for another by sacrifice", () => {
    const game = makeGame();
    open(game);
    // Crosis's Attendant: "{1}, Sacrifice this creature: Add {U}{B}{R}".
    spawn(game, ["Crosis's Attendant", "Swamp"]);
    expect(canCast(game, "Opt")).toBe(false);
    // Golden Egg: "{1}, {T}, Sacrifice: Add one mana of any color".
    const egg = makeGame();
    open(egg);
    spawn(egg, ["Golden Egg", "Swamp"]);
    expect(canCast(egg, "Opt")).toBe(false);
  });
});
