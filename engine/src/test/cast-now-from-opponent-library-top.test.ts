/**
 * `cast-now` from the top of another player's library (`from: { libraryTop,
 * reveal, of }`) and its `rest: "graveyard"`: Talent of the Telepath's
 * "Target opponent reveals the top seven cards of their library. You may cast
 * an instant or sorcery spell from among them without paying its mana cost.
 * Then that player puts the rest into their graveyard", and spell mastery's
 * "up to two … instead of one" (`repeat` with `upTo: 2`).
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { viewFor } from "../view.js";
import { A, B, C, cast, lands, ref, table, toGraveyard, toHand } from "./harness.js";

type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** Put `names` on top of `player`'s library, the first one on top. */
const stackLibrary = (game: Game, names: readonly string[], player: PlayerId): ObjectId[] =>
  [...names].reverse().map((name) => game.debugSpawn(name, player, "library")).reverse();
const free = (card: ObjectId, targets: readonly (TargetRef | null)[] = []): Cast => ({
  type: "cast-spell",
  player: A,
  card,
  targets,
  via: "effect",
  free: true,
});
const names = (game: Game, ids: readonly ObjectId[]): string[] => ids.map((id) => game.state.objects[id].cardName).sort();

const TOP = ["Lightning Bolt", "Divination", "Grizzly Bears", "Opt", "Island", "Lava Spike", "Hill Giant", "Shivan Dragon"];

describe("Talent of the Telepath", () => {
  it("offers the instants and sorceries among the opponent's top seven, revealed; the rest go to their graveyard", () => {
    const { game, a } = table({ players: 3 });
    const top = stackLibrary(game, TOP, B);
    const seven = top.slice(0, 7);
    const divination = top[1];
    let offer: CastNowOffer | undefined;
    let seenByCarol = false;
    a.chooseCastNowFn = (_view, offered) => {
      offer = offered;
      // Revealed (rule 701.16a): every player sees them, not only the caster.
      seenByCarol = seven.every((id) => viewFor(game.state, game.registry, C).objects[id] !== undefined);
      return free(divination);
    };
    lands(game, "Island", 4);
    const handBefore = game.handOf(A).length;
    cast(game, toHand(game, "Talent of the Telepath"), { targets: [ref(B)] });
    expect(offer!.looked).toEqual(seven);
    expect(names(game, offer!.cards)).toEqual(["Divination", "Lava Spike", "Lightning Bolt", "Opt"]);
    expect(seenByCarol).toBe(true);
    // Divination resolved for alice, and went to its owner's graveyard.
    expect(game.handOf(A).length).toBe(handBefore + 2);
    expect(game.state.zones.perPlayer[B].graveyard).toContain(divination);
    // The other six went to bob's graveyard; the eighth card is still on top.
    expect(seven.every((id) => game.state.objects[id].zone === "graveyard")).toBe(true);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(top[7]);
  });

  it("with spell mastery, casts up to two of them", () => {
    const { game, a } = table();
    const top = stackLibrary(game, TOP, B);
    const [bolt, , , , , spike] = top;
    toGraveyard(game, "Opt");
    toGraveyard(game, "Lightning Bolt");
    const offers: CastNowOffer[] = [];
    a.chooseCastNowFn = (_view, offered) => {
      offers.push(offered);
      return offers.length === 1 ? free(bolt, [ref(B)]) : offers.length === 2 ? free(spike, [ref(B)]) : null;
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Talent of the Telepath"), { targets: [ref(B)] });
    expect(offers).toHaveLength(2);
    expect(game.state.players[B].life).toBe(14);
    expect(top.slice(0, 7).every((id) => game.state.objects[id].zone === "graveyard")).toBe(true);
  });

  it("without spell mastery, only one", () => {
    const { game, a } = table();
    const top = stackLibrary(game, TOP, B);
    toGraveyard(game, "Opt");
    let offers = 0;
    a.chooseCastNowFn = () => {
      offers += 1;
      return offers === 1 ? free(top[0], [ref(B)]) : null;
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Talent of the Telepath"), { targets: [ref(B)] });
    expect(offers).toBe(1);
    expect(game.state.players[B].life).toBe(17);
  });

  it("with nothing to cast among them, all seven go to the graveyard", () => {
    const { game, a } = table();
    const top = stackLibrary(game, ["Island", "Grizzly Bears", "Hill Giant", "Forest", "Island", "Shivan Dragon", "Swamp", "Opt"], B);
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return null;
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Talent of the Telepath"), { targets: [ref(B)] });
    expect(offered).toBe(false);
    expect(top.slice(0, 7).every((id) => game.state.objects[id].zone === "graveyard")).toBe(true);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(top[7]);
  });
});
