/**
 * An activated ability's own "this ability costs {N} less to activate if …":
 * the condition read as it's activated, coloured mana off the cost (rule 118.7),
 * and `abilityCostModification` reaching a hand and a graveyard (`anyZone`) or
 * one Aura's host (`hostOfSource`).
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  cast,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

/** What `player` can currently activate of `source`. */
const offered = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((o) => o.kind === "activate-ability" && o.source === source);

describe("a condition on an ability's own reduction", () => {
  it("Esquire of the King: {4}{W} without a legendary creature, {2}{W} with one", () => {
    const { game } = table();
    const esquire = spawn(game, "Esquire of the King", A);
    lands(game, "Plains", 3);
    expect(offered(game, esquire)).toBe(false);
    const elder = spawn(game, "Isamaru, Hound of Konda", A);
    expect(offered(game, esquire)).toBe(true);
    activate(game, esquire);
    expect(pt(game, elder).power).toBe(3);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(4);
  });

  it("Hylda's Crown of Winter: free during your turn, {1} on another's", () => {
    const { game } = table();
    const crown = spawn(game, "Hylda's Crown of Winter", A);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(offered(game, crown)).toBe(true);
    activate(game, crown, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game); // bob's
    nextTurn(game); // alice's: the Crown untaps
    nextTurn(game); // bob's again
    expect(game.state.objects[crown].tapped).toBe(false);
    game.advanceUntil((s) => s.priority.holder === A);
    expect(offered(game, crown)).toBe(false); // no mana
    lands(game, "Wastes", 1);
    expect(offered(game, crown)).toBe(true);
  });

  it("Crown of Gondor: an equip that's {1} for the monarch and {4} otherwise", () => {
    const { game } = table();
    const crown = spawn(game, "Crown of Gondor", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Wastes", 1);
    expect(offered(game, crown)).toBe(false);
    game.debugApplyEffect(A, { kind: "become-monarch" }, []);
    expect(offered(game, crown)).toBe(true);
    activate(game, crown, 0, { targets: [ref(bears)] });
    expect(game.state.objects[crown].attachedTo).toBe(bears);
    expect(pt(game, bears).power).toBe(3); // +1/+1 for the one creature
  });

  it("Crown of Gondor: a legendary creature entering makes you the monarch only if there is none", () => {
    const { game } = table();
    spawn(game, "Crown of Gondor", A);
    game.debugSpawn("Isamaru, Hound of Konda", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder === A);
    expect(game.state.monarch).toBe(A);
  });

  it("Razorlash Transmogrant: from the graveyard, cheaper while an opponent has four nonbasics", () => {
    const { game } = table();
    const card = toGraveyard(game, "Razorlash Transmogrant", A);
    lands(game, "Swamp", 2);
    expect(offered(game, card)).toBe(false);
    for (let i = 0; i < 4; i += 1) spawn(game, "Wastes", B); // basic lands
    expect(offered(game, card)).toBe(false);
    for (let i = 0; i < 4; i += 1) spawn(game, "Tranquil Cove", B);
    expect(offered(game, card)).toBe(true);
    activate(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].counters["+1/+1"]).toBe(1);
  });
});

describe("coloured mana off an ability's cost", () => {
  it("Kami of Jealous Thirst: nothing to pay after three draws, its whole cost before", () => {
    const { game } = table();
    const kami = spawn(game, "Kami of Jealous Thirst", A);
    expect(offered(game, kami)).toBe(false);
    game.debugApplyEffect(A, { kind: "draw", amount: 3 }, []);
    expect(offered(game, kami)).toBe(true);
    activate(game, kami);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    // Only once each turn.
    expect(offered(game, kami)).toBe(false);
  });

  it("Flying Drone: {1}{U} off with another flyer arrived, not for itself or a ground creature", () => {
    const { game } = table();
    const drone = game.debugSpawn("Flying Drone", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder === A);
    expect(offered(game, drone)).toBe(false); // it itself doesn't count
    game.debugSpawn("Grizzly Bears", A, "battlefield", { announceEntry: true, summoningSick: false });
    expect(offered(game, drone)).toBe(false);
    game.debugSpawn("Wind Drake", A, "battlefield", { announceEntry: true, summoningSick: false });
    expect(offered(game, drone)).toBe(true);
    const before = hand(game, A).length;
    toHand(game, "Wastes", A);
    activate(game, drone);
    expect(hand(game, A).length).toBe(before + 1); // drew one, discarded one
  });

  it("without its condition the Drone pays its whole {1}{U}, which takes blue mana", () => {
    const { game } = table();
    const drone = spawn(game, "Flying Drone", A);
    lands(game, "Wastes", 2);
    expect(offered(game, drone)).toBe(false);
    lands(game, "Island", 1);
    expect(offered(game, drone)).toBe(true);
  });
});

describe("abilityCostModification beyond a permanent's abilities", () => {
  it("Suppression Field: {2} more on a permanent's ability and on cycling from a hand, not a mana ability", () => {
    const { game } = table();
    spawn(game, "Suppression Field", B);
    const krosan = toHand(game, "Krosan Tusker", A); // cycling {2}{G}
    const stone = spawn(game, "Mind Stone", A);
    lands(game, "Forest", 3);
    const cycle = (): boolean => game.legalActions(A).some((o) => o.kind === "cycle" && o.card === krosan);
    expect(cycle()).toBe(false);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === stone && o.abilityIndex === 0)).toBe(true);
    lands(game, "Forest", 2);
    expect(cycle()).toBe(true);
  });

  it("Oppressive Rays: only the enchanted creature's abilities cost {3} more", () => {
    const { game } = table();
    const esquire = spawn(game, "Esquire of the King", A);
    const other = spawn(game, "Esquire of the King", A);
    lands(game, "Wastes", 4);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Oppressive Rays"), { targets: [ref(esquire)] });
    expect(named(game, "Oppressive Rays", A).length).toBe(1);
    lands(game, "Plains", 1); // five mana left
    expect(offered(game, other)).toBe(true);
    expect(offered(game, esquire)).toBe(false);
    lands(game, "Plains", 3); // eight
    expect(offered(game, esquire)).toBe(true);
  });
});
