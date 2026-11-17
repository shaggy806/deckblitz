/**
 * "Whenever one or more creatures you control and/or creature cards in your
 * graveyard are put into exile" (Kaya, Spirits' Justice): a `put-into-exile`
 * trigger with `controlledFromBattlefield` — an arrival from the battlefield
 * counts as the permanent it was, whose by its controller and matched as it
 * last existed (rule 603.10a), a token included; one from a graveyard as a
 * card, whose by its owner — once for one move. As it resolves, a creature
 * card chosen from among them still in exile (`"trigger-batch"`, rule 400.7)
 * is what the targeted token becomes a copy of until end of turn, with flying.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

import { A, B, activate, keywords, nextTurn, pickFromZone, pickTargets, pt, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const name = (game: Game, id: ObjectId): string => nameOf(game.state.objects[id]);

const kayaTriggers = (game: Game, kaya: ObjectId, from: number): number =>
  game.state.eventLog.slice(from).filter((e) => e.type === "ability-triggered" && e.source === kaya).length;

/** Alice's Kaya and a Spirit token of hers. */
function setUp() {
  const t = table();
  const kaya = spawn(t.game, "Kaya, Spirits' Justice");
  const before = new Set(t.game.state.zones.shared.battlefield);
  t.game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 });
  const token = t.game.state.zones.shared.battlefield.find((id) => !before.has(id))!;
  return { ...t, kaya, token };
}

describe("Kaya, Spirits' Justice", () => {
  it("a creature you control and a creature card from your graveyard exiled at once: one trigger, the token a copy with flying", () => {
    const { game, a, kaya, token } = setUp();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = toGraveyard(game, "Hill Giant", A);
    toGraveyard(game, "Lightning Bolt", A);
    pickTargets(a, token);
    const seen = pickFromZone(a, giant);
    const from = game.state.eventLog.length;
    game.debugApplyEffect(
      B,
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0 },
          { kind: "exile-graveyard", target: 1 },
        ],
      },
      [ref(bears), ref(A)],
    );
    settle(game);
    expect(kayaTriggers(game, kaya, from)).toBe(1);
    // The creature cards among them, from exile; the instant isn't one.
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(name(game, token)).toBe("Hill Giant");
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, token).has("flying")).toBe(true);
    expect(zone(game, giant)).toBe("exile");
    // Until end of turn.
    nextTurn(game);
    expect(name(game, token)).not.toBe("Hill Giant");
  });

  it("may choose nothing", () => {
    const { game, a, token } = setUp();
    const bears = spawn(game, "Grizzly Bears", A);
    pickTargets(a, token);
    pickFromZone(a);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    settle(game);
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
  });

  it("a token you control exiled triggers it, though there's no card to choose", () => {
    const { game, a, kaya, token } = setUp();
    const before = new Set(game.state.zones.shared.battlefield);
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 });
    const other = game.state.zones.shared.battlefield.find((id) => !before.has(id))!;
    expect(game.state.objects[other].isToken).toBe(true);
    pickTargets(a, token);
    const from = game.state.eventLog.length;
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(other)]);
    settle(game);
    expect(kayaTriggers(game, kaya, from)).toBe(1);
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
  });

  it("another player's creature, or a card from their graveyard, or a noncreature card of yours: nothing", () => {
    const { game, kaya } = setUp();
    const theirs = spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt", A);
    const from = game.state.eventLog.length;
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(theirs)]);
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: 0 }, [ref(B)]);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: 0 }, [ref(A)]);
    settle(game);
    expect(kayaTriggers(game, kaya, from)).toBe(0);
  });

  it("an opponent's creature you control counts as yours", () => {
    const { game, a, kaya, token } = setUp();
    const stolen = spawn(game, "Grizzly Bears", B);
    game.state.objects[stolen].controller = A;
    pickTargets(a, token);
    pickFromZone(a, stolen);
    const from = game.state.eventLog.length;
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(stolen)]);
    settle(game);
    expect(kayaTriggers(game, kaya, from)).toBe(1);
    expect(name(game, token)).toBe("Grizzly Bears");
  });

  it("+2: surveils 2, then exiles a card from a graveyard — a creature card of hers, which her trigger answers", () => {
    const { game, a, kaya, token } = setUp();
    const bears = toGraveyard(game, "Grizzly Bears", A);
    pickFromZone(a, bears);
    pickTargets(a, token);
    activate(game, kaya, 0);
    expect(game.state.objects[kaya].counters.loyalty).toBe(5);
    expect(zone(game, bears)).toBe("exile");
    expect(name(game, token)).toBe("Grizzly Bears");
    expect(keywords(game, token).has("flying")).toBe(true);
  });

  it("−2: exiles a creature of yours and up to one of each other player's, and her trigger answers", () => {
    const { game, a, kaya, token } = setUp();
    const mine = spawn(game, "Hill Giant", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    pickFromZone(a, mine);
    pickTargets(a, token);
    activate(game, kaya, 2, { targets: [ref(mine), ref(theirs), null, null] });
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(name(game, token)).toBe("Hill Giant");
  });
});
