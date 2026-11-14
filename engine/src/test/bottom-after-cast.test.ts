/**
 * "You may cast that card … If that spell would be put into a graveyard,
 * put it on the bottom of its owner's library instead" — `PlayTerms
 * .bottomAfter` (a `grant-play`'s, or a `cast-now`'s): a replacement on the
 * spell (rule 614.1a) while it's a spell, from the stack, whether it resolves,
 * is countered or loses its targets; a permanent it became is no longer that
 * spell. Quintorius, Loremaster, written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const libraryOf = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const onBottom = (game: Game, id: ObjectId, player = A): boolean => {
  // The library's last entry is its bottom (the top is index 0).
  const library = libraryOf(game, player);
  return library.length > 1 && library.indexOf(id) === library.length - 1;
};
const castable = (game: Game, id: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === id);
/** Cast `id` from exile as the permission offers it: free, as Quintorius's is. */
const castFromExile = (game: Game, id: ObjectId, targets: readonly (TargetRef | null)[], settleIt = true): void => {
  const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === id);
  if (offer?.kind !== "cast-spell") throw new Error("no cast offered");
  cast(game, id, {
    targets,
    settle: settleIt,
    ...(offer.via !== undefined ? { via: offer.via } : {}),
    free: true,
  });
};

/** Quintorius on the battlefield with `card` exiled with it by its end-step
 * trigger, and a Spirit token to sacrifice; back in Alice's main phase. */
function exiledWithQuintorius(card: string): { game: Game; quintorius: ObjectId; exiled: ObjectId; a: ReturnType<typeof table>["a"]; b: ReturnType<typeof table>["b"] } {
  const t = table();
  const { game, a } = t;
  const quintorius = spawn(game, "Quintorius, Loremaster");
  const exiled = toGraveyard(game, card);
  pickTargets(a, exiled);
  toStep(game, "end");
  settle(game);
  expect(zone(game, exiled)).toBe("exile");
  expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(1);
  nextTurn(game);
  nextTurn(game);
  return { game, quintorius, exiled, a: t.a, b: t.b };
}

// A `cast-now`'s rider, as Kylox's Voltstrider's ("you may cast an instant or
// sorcery spell from among cards exiled with it. If that spell would be put
// into a graveyard, put it on the bottom of its owner's library instead"),
// which also waits on its collect-evidence exile being linked.
const HEIST = "Test Bottom Heist";
const bottomHeist = defineCard({
  name: HEIST,
  manaCost: "{0}",
  types: ["sorcery"],
  text: "You may cast target instant card from your graveyard without paying its mana cost. If that spell would be put into a graveyard, put it on the bottom of its owner's library instead.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "instant" } }],
  effect: { kind: "cast-now", target: 0, free: true, bottomAfter: true },
});

describe("a cast-now's bottomAfter", () => {
  it("the spell cast as it resolves goes to the bottom of its owner's library", () => {
    const { game, a } = table({ ownRegistry: true });
    game.registry.register(bottomHeist);
    const bolt = toGraveyard(game, "Lightning Bolt");
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true });
    cast(game, toHand(game, HEIST), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("library");
    expect(onBottom(game, bolt)).toBe(true);
  });
});

describe("Quintorius, Loremaster", () => {
  it("exiles a noncreature, nonland card at your end step and makes a 3/2 Spirit; a creature card can't be chosen", () => {
    const { game, a } = table();
    spawn(game, "Quintorius, Loremaster");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const shock = toGraveyard(game, "Shock");
    const seen = watchTargets(a, () => [bolt]);
    toStep(game, "end");
    settle(game);
    expect(seen.offered[0]).toContain(shock);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, shock)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(1);
  });

  it("with no noncreature, nonland card in your graveyard, nothing happens — no Spirit either", () => {
    const { game } = table();
    spawn(game, "Quintorius, Loremaster");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(0);
  });

  it("casts the card free this turn; after it resolves it goes to the bottom of its owner's library", () => {
    const { game, quintorius, exiled } = exiledWithQuintorius("Lightning Bolt");
    lands(game, "Plateau", 3);
    expect(castable(game, exiled)).toBe(false);
    const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
    activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
    expect(game.state.objects[spirit]?.zone).not.toBe("battlefield");
    expect(castable(game, exiled)).toBe(true);
    castFromExile(game, exiled, [ref(B)]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, exiled)).toBe("library");
    expect(onBottom(game, exiled)).toBe(true);
    expect(graveyard(game, A)).not.toContain(exiled);
  });

  it("a spell that loses its target goes to the bottom too", () => {
    const { game, quintorius, exiled } = exiledWithQuintorius("Lightning Bolt");
    lands(game, "Plateau", 3);
    const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
    castFromExile(game, exiled, [ref(bears)], false);
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(zone(game, exiled)).toBe("library");
    expect(onBottom(game, exiled)).toBe(true);
  });

  it("with Rest in Peace out, its controller chooses which applies first (rules 614.15, 616.1)", () => {
    for (const [answer, where] of [
      [0, "library"],
      [1, "exile"],
    ] as const) {
      const { game, quintorius, exiled, a } = exiledWithQuintorius("Lightning Bolt");
      lands(game, "Plateau", 3);
      spawn(game, "Rest in Peace", B);
      const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
      activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
      let asked: readonly string[] = [];
      a.chooseModesFn = (_view, _min, _max, texts) => {
        asked = texts;
        return [answer];
      };
      castFromExile(game, exiled, [ref(B)]);
      expect(life(game, B)).toBe(17);
      expect(asked).toHaveLength(2);
      expect(asked[0]).toMatch(/bottom of its owner's library/);
      expect(zone(game, exiled)).toBe(where);
      if (where === "library") expect(onBottom(game, exiled)).toBe(true);
    }
  });

  it("losing its target with Rest in Peace out asks the same", () => {
    const { game, quintorius, exiled, a } = exiledWithQuintorius("Lightning Bolt");
    lands(game, "Plateau", 3);
    spawn(game, "Rest in Peace", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
    activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    castFromExile(game, exiled, [ref(bears)], false);
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(asked).toBe(1);
    expect(zone(game, exiled)).toBe("exile");
  });

  it("nothing is asked with no exile competing", () => {
    const { game, quintorius, exiled, a } = exiledWithQuintorius("Lightning Bolt");
    lands(game, "Plateau", 3);
    const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
    activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    castFromExile(game, exiled, [ref(B)]);
    expect(asked).toBe(0);
    expect(zone(game, exiled)).toBe("library");
  });

  it("with Feather's exile too, its controller picks which applies (rule 616.1)", () => {
    for (const [answer, where] of [
      [0, "exile"],
      [1, "library"],
    ] as const) {
      const { game, quintorius, exiled, a } = exiledWithQuintorius("Giant Growth");
      lands(game, "Plateau", 3);
      const feather = spawn(game, "Feather, the Redeemed");
      const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
      activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
      let asked: readonly string[] = [];
      a.chooseModesFn = (_view, _min, _max, texts) => {
        asked = texts;
        return [answer];
      };
      castFromExile(game, exiled, [ref(feather)]);
      expect(asked[1]).toMatch(/bottom of its owner's library/);
      expect(zone(game, exiled)).toBe(where);
    }
  });

  it("a permanent it became is no longer that spell: it dies into the graveyard", () => {
    const { game, quintorius, exiled } = exiledWithQuintorius("Pacifism");
    lands(game, "Plateau", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
    activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
    castFromExile(game, exiled, [ref(bears)]);
    expect(zone(game, exiled)).toBe("battlefield");
    game.debugMove(exiled, "graveyard");
    settle(game);
    expect(zone(game, exiled)).toBe("graveyard");
  });

  it("only this turn", () => {
    const { game, quintorius, exiled } = exiledWithQuintorius("Lightning Bolt");
    lands(game, "Plateau", 3);
    const spirit = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken === true)!;
    activate(game, quintorius, 0, { targets: [ref(exiled)], sacrifice: spirit });
    nextTurn(game);
    nextTurn(game);
    expect(castable(game, exiled)).toBe(false);
  });

  it("a card exiled by something else isn't a card exiled with Quintorius", () => {
    const { game } = table();
    lands(game, "Plateau", 3);
    const quintorius = spawn(game, "Quintorius, Loremaster");
    const other = game.debugSpawn("Lightning Bolt", A, "exile");
    enter(game, "Grizzly Bears");
    const spirit = spawn(game, "Spirit Token (Red-White)");
    expect(() => activate(game, quintorius, 0, { targets: [ref(other)], sacrifice: spirit })).toThrow(/target/i);
  });
});
