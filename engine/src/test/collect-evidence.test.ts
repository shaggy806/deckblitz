/**
 * Collect evidence (rule 701.59): "To 'collect evidence N' means to exile any
 * number of cards from your graveyard with total mana value N or greater"
 * (701.59a); a player who can't can't choose to (701.59b); a spell may refer
 * to whether evidence was collected for it (701.59c). As a spell's additional
 * cost (Crimestopper Sprite), an activated ability's cost (Forensic
 * Researcher) and an effect (Surveillance Monitor), with "whenever you
 * collect evidence".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  lands,
  pickFromZone,
  pickTargets,
  settle,
  spawn,
  table,
  toGraveyard,
  tokensNamed,
} from "./harness.js";

const exiled = (game: Game, ids: readonly ObjectId[]) => ids.filter((id) => game.state.objects[id].zone === "exile");

describe("collect evidence", () => {
  it("as an additional cost: offered only with enough mana value in the graveyard; 'if evidence was collected'", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const sprite = game.debugSpawn("Crimestopper Sprite", A, "hand");
    const kickedOffers = () =>
      game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.card === sprite && l.kicked === true);
    // Two Bears (mana value 4): not enough for 6.
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")];
    expect(kickedOffers()).toHaveLength(0);
    cards.push(toGraveyard(game, "Hill Giant")); // 2 + 2 + 4 = 8
    expect(kickedOffers()).toHaveLength(1);
    // Two cards worth 6: a Hill Giant and one Bears.
    const seen = pickFromZone(a, cards[2], cards[0]);
    pickTargets(a, bear);
    cast(game, sprite, { kicked: true });
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining(cards));
    expect(exiled(game, cards)).toEqual([cards[0], cards[2]]);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(counters(game, bear, "stun")).toBe(1);
  });

  it("the chosen cards must reach the total", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant"), toGraveyard(game, "Grizzly Bears")];
    pickTargets(a, null);
    cast(game, game.debugSpawn("Crimestopper Sprite", A, "hand"), { kicked: true, settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone");
    // 2 + 2 = 4: refused.
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [cards[0], cards[2]] })).toMatch(/total mana value/);
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [cards[1], cards[2]] })).toBeNull();
  });

  it("as an activated ability's cost", () => {
    const { game, a } = table();
    const researcher = spawn(game, "Forensic Researcher");
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    pickTargets(a, bear);
    activate(game, researcher, 1, { targets: [{ kind: "object", object: bear }] });
    settle(game);
    expect(game.state.objects[giant].zone).toBe("exile");
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("can't be activated without enough in the graveyard", () => {
    const { game } = table();
    const researcher = spawn(game, "Forensic Researcher");
    spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Llanowar Elves"); // 1 < 3
    const offers = game
      .legalActions(A)
      .filter((l) => l.kind === "activate-ability" && l.source === researcher && l.abilityIndex === 1);
    expect(offers).toHaveLength(0);
  });

  it("as an effect: 'you may'; collecting triggers 'whenever you collect evidence', declining doesn't", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    enter(game, "Surveillance Monitor");
    settle(game);
    expect(game.state.objects[giant].zone).toBe("exile");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    // A second Monitor: both see the collecting.
    const other = toGraveyard(game, "Hill Giant");
    pickFromZone(a); // decline this time
    enter(game, "Surveillance Monitor");
    settle(game);
    expect(game.state.objects[other].zone).toBe("graveyard");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    expect(graveyard(game)).toContain(other);
  });
});
